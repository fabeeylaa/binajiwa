import pool from "../config/db.js";

const ARTICLE_RECOMMENDATION_MAP = {
  phq9: {
    Minimal: ["mental health"],
    Ringan: ["mental health", "tidur"],
    Sedang: ["mental health", "tidur", "nutrisi"],
    "Sedang-berat": ["mental health"],
    Berat: ["mental health"],
  },
  gad7: {
    Minimal: ["mental health"],
    Ringan: ["mental health", "olahraga"],
    Sedang: ["mental health", "olahraga", "tidur"],
    Berat: ["mental health"],
  },
  wellness_check: {
    Baik: ["mental health"],
    "Perlu perhatian": ["tidur", "nutrisi", "olahraga"],
    "Disarankan konsultasi": ["mental health"],
  },
};

// GET /assessments — daftar semua kuesioner yang tersedia
export const getAssessments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.code, a.title, a.instruction, a.source,
              a.description, a.is_starter,
              (SELECT COUNT(*)::int FROM assessment_questions q
                WHERE q.assessment_id = a.id) AS question_count,
              (SELECT r.created_at FROM assessment_results r
                WHERE r.assessment_id = a.id AND r.user_id = $1
                ORDER BY r.created_at DESC LIMIT 1) AS last_taken_at,
              (SELECT r.category_label FROM assessment_results r
                WHERE r.assessment_id = a.id AND r.user_id = $1
                ORDER BY r.created_at DESC LIMIT 1) AS last_category
       FROM assessments a
       ORDER BY a.is_starter DESC, a.id`,
      [req.user.id],
    );
    res.status(200).json({ assessments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// GET /assessments/:id — pertanyaan + opsi jawaban 1 kuesioner
export const getAssessmentDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await pool.query(
      "SELECT id, code, title, instruction, source FROM assessments WHERE id = $1",
      [id],
    );
    if (assessment.rows.length === 0) {
      return res.status(404).json({ message: "Assessment tidak ditemukan" });
    }

    const questions = await pool.query(
      `SELECT q.id, q.question_text, q.order_number,
              o.id AS option_id, o.option_text, o.score_value, o.order_number AS option_order
       FROM assessment_questions q
       JOIN assessment_options o ON o.question_id = q.id
       WHERE q.assessment_id = $1
       ORDER BY q.order_number, o.order_number`,
      [id],
    );

    // kelompokkan opsi per pertanyaan
    const questionMap = new Map();
    for (const row of questions.rows) {
      if (!questionMap.has(row.id)) {
        questionMap.set(row.id, {
          id: row.id,
          question_text: row.question_text,
          order_number: row.order_number,
          options: [],
        });
      }
      questionMap.get(row.id).options.push({
        id: row.option_id,
        option_text: row.option_text,
        score_value: row.score_value,
      });
    }

    res.status(200).json({
      assessment: assessment.rows[0],
      questions: Array.from(questionMap.values()),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// POST /assessments/:id/submit — kirim jawaban, dapat skor + rekomendasi artikel
// body: { answers: [{ question_id, option_id }, ...] }
export const submitAssessment = async (req, res) => {
  const assessmentId = parseInt(req.params.id, 10);
  const { answers } = req.body ?? {};

  if (!Number.isInteger(assessmentId)) {
    return res.status(400).json({ message: "ID assessment tidak valid" });
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Jawaban tidak boleh kosong" });
  }
  const optionIds = answers.map((a) => Number(a?.option_id));
  if (optionIds.some((n) => !Number.isInteger(n))) {
    return res.status(400).json({ message: "Format jawaban tidak valid" });
  }

  // Validasi di server (jangan percaya client): semua pertanyaan milik assessment
  // ini harus terjawab tepat satu kali, dan tiap opsi harus milik pertanyaan itu.
  let optionMap;
  try {
    const questions = await pool.query(
      "SELECT id FROM assessment_questions WHERE assessment_id = $1",
      [assessmentId],
    );
    if (questions.rows.length === 0) {
      return res.status(404).json({ message: "Assessment tidak ditemukan" });
    }

    const optionsResult = await pool.query(
      `SELECT o.id AS option_id, o.score_value, o.question_id, q.is_sensitive, q.assessment_id
       FROM assessment_options o
       JOIN assessment_questions q ON q.id = o.question_id
       WHERE o.id = ANY($1::int[])`,
      [optionIds],
    );
    optionMap = new Map(optionsResult.rows.map((r) => [r.option_id, r]));

    const answered = new Set();
    for (const optionId of optionIds) {
      const opt = optionMap.get(optionId);
      if (!opt || opt.assessment_id !== assessmentId) {
        return res.status(400).json({ message: `Opsi jawaban tidak valid: ${optionId}` });
      }
      if (answered.has(opt.question_id)) {
        return res.status(400).json({ message: "Satu pertanyaan hanya boleh dijawab satu kali" });
      }
      answered.add(opt.question_id);
    }
    if (answered.size !== questions.rows.length) {
      return res.status(400).json({
        message: `Semua pertanyaan wajib dijawab (${answered.size}/${questions.rows.length})`,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalScore = 0;
    let flagged = false;
    for (const optionId of optionIds) {
      const opt = optionMap.get(optionId);
      totalScore += opt.score_value;
      if (opt.is_sensitive && opt.score_value > 0) flagged = true;
    }

    // cari kategori berdasarkan skor
    const rangeResult = await client.query(
      `SELECT category_label, result_message FROM assessment_score_ranges
       WHERE assessment_id = $1 AND $2 BETWEEN min_score AND max_score`,
      [assessmentId, totalScore],
    );
    const category = rangeResult.rows[0] || { category_label: "Tidak diketahui", result_message: null };

    // simpan hasil
    const resultInsert = await client.query(
      `INSERT INTO assessment_results (user_id, assessment_id, total_score, category_label, result_message, flagged)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, assessmentId, totalScore, category.category_label, category.result_message, flagged],
    );
    const resultId = resultInsert.rows[0].id;

    // simpan jawaban detail (question_id diambil dari DB, bukan dari client)
    for (const optionId of optionIds) {
      await client.query(
        `INSERT INTO assessment_answers (result_id, question_id, option_id) VALUES ($1, $2, $3)`,
        [resultId, optionMap.get(optionId).question_id, optionId],
      );
    }

    await client.query("COMMIT");

    const assessmentInfo = await pool.query("SELECT code FROM assessments WHERE id = $1", [assessmentId]);
    const assessmentCode = assessmentInfo.rows[0]?.code;

    // rekomendasi artikel sesuai kategori hasil
    const topics = ARTICLE_RECOMMENDATION_MAP[assessmentCode]?.[category.category_label] || [];

    const articles = topics.length > 0
      ? await pool.query(
          // LOWER() supaya cocok walau huruf besar/kecil kategori artikel berbeda;
          // slug dikirim agar frontend bisa membuat link ke artikelnya.
          "SELECT id, title, slug, category FROM articles WHERE LOWER(category) = ANY($1) ORDER BY created_at DESC LIMIT 5",
          [topics],
        )
      : { rows: [] };

    res.status(201).json({
      message: "Assessment berhasil disubmit",
      result: resultInsert.rows[0],
      recommended_articles: articles.rows,
      // penanda ke frontend: kalau true, tampilkan info bantuan krisis, bukan cuma artikel
      needs_immediate_attention: flagged,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  } finally {
    client.release();
  }
};

// GET /assessments/history — riwayat hasil assessment milik user
export const getAssessmentHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.total_score, r.category_label, r.result_message, r.flagged, r.created_at,
              a.title AS assessment_title, a.code AS assessment_code,
              (SELECT MAX(sr.max_score) FROM assessment_score_ranges sr
                WHERE sr.assessment_id = r.assessment_id) AS max_score
       FROM assessment_results r
       JOIN assessments a ON a.id = r.assessment_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id],
    );
    res.status(200).json({ history: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};