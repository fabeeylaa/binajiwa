-- ============================================
-- 1. PHQ-9 - Skrining Depresi
-- Sumber: Kroenke K, Spitzer RL, Williams JBW (2001).
-- "The PHQ-9: Validity of a Brief Depression Severity Measure."
-- J Gen Intern Med. 16(9):606-613.
-- ============================================
INSERT INTO assessments (code, title, instruction, source) VALUES
('phq9', 'PHQ-9 (Skrining Depresi)',
 'Dalam 2 minggu terakhir, seberapa sering kamu terganggu oleh masalah-masalah berikut?',
 'Kroenke, Spitzer & Williams (2001), J Gen Intern Med 16(9):606-613');
z
INSERT INTO assessment_questions (assessment_id, question_text, order_number, is_sensitive) VALUES
(1, 'Kurang minat atau kurang bersemangat dalam melakukan aktivitas apapun', 1, false),
(1, 'Merasa murung, sedih, atau putus asa', 2, false),
(1, 'Sulit tidur, sering terbangun, atau justru tidur berlebihan', 3, false),
(1, 'Merasa lelah atau kurang tenaga', 4, false),
(1, 'Nafsu makan berkurang atau justru makan berlebihan', 5, false),
(1, 'Merasa buruk tentang diri sendiri, merasa gagal atau mengecewakan orang lain', 6, false),
(1, 'Sulit berkonsentrasi, misalnya saat membaca atau mengerjakan tugas', 7, false),
(1, 'Bergerak/bicara lebih lambat dari biasanya, atau justru gelisah dan sulit diam', 8, false),
(1, 'Muncul pikiran bahwa lebih baik tidak hidup, atau menyakiti diri sendiri', 9, true);

-- opsi jawaban tiap pertanyaan PHQ-9 (question_id 1-9)
INSERT INTO assessment_options (question_id, option_text, score_value, order_number)
SELECT q.id, o.text, o.val, o.ord
FROM assessment_questions q
CROSS JOIN (VALUES
  ('Tidak sama sekali', 0, 1),
  ('Beberapa hari', 1, 2),
  ('Lebih dari separuh hari', 2, 3),
  ('Hampir setiap hari', 3, 4)
) AS o(text, val, ord)
WHERE q.assessment_id = 1;

INSERT INTO assessment_score_ranges (assessment_id, min_score, max_score, category_label, result_message) VALUES
(1, 0, 4, 'Minimal', 'Gejala depresi kamu berada di level minimal. Tetap jaga kebiasaan sehat ya.'),
(1, 5, 9, 'Ringan', 'Ada indikasi gejala depresi ringan. Coba perhatikan pola tidur, aktivitas, dan dukungan sosialmu.'),
(1, 10, 14, 'Sedang', 'Gejala depresi kamu di level sedang. Pertimbangkan untuk bicara dengan konselor atau psikolog.'),
(1, 15, 19, 'Sedang-berat', 'Gejala depresi cukup signifikan. Sangat disarankan berkonsultasi dengan profesional kesehatan mental.'),
(1, 20, 27, 'Berat', 'Gejala depresi berat terdeteksi. Segera hubungi psikolog/psikiater atau layanan konseling kampus.');

-- ============================================
-- 2. GAD-7 — Skrining Kecemasan
-- Sumber: Spitzer RL, Kroenke K, Williams JBW, Löwe B (2006).
-- "A Brief Measure for Assessing Generalized Anxiety Disorder: The GAD-7."
-- Arch Intern Med. 166(10):1092-1097.
-- ============================================
INSERT INTO assessments (code, title, instruction, source) VALUES
('gad7', 'GAD-7 (Skrining Kecemasan)',
 'Dalam 2 minggu terakhir, seberapa sering kamu terganggu oleh masalah-masalah berikut?',
 'Spitzer, Kroenke, Williams & Löwe (2006), Arch Intern Med 166(10):1092-1097');

INSERT INTO assessment_questions (assessment_id, question_text, order_number, is_sensitive) VALUES
(2, 'Merasa gugup, cemas, atau tegang', 1, false),
(2, 'Tidak bisa berhenti khawatir atau mengendalikan rasa khawatir', 2, false),
(2, 'Terlalu khawatir tentang berbagai hal', 3, false),
(2, 'Sulit untuk rileks', 4, false),
(2, 'Begitu gelisah sehingga sulit duduk diam', 5, false),
(2, 'Mudah kesal atau marah', 6, false),
(2, 'Merasa takut seolah-olah sesuatu yang buruk akan terjadi', 7, false);

INSERT INTO assessment_options (question_id, option_text, score_value, order_number)
SELECT q.id, o.text, o.val, o.ord
FROM assessment_questions q
CROSS JOIN (VALUES
  ('Tidak sama sekali', 0, 1),
  ('Beberapa hari', 1, 2),
  ('Lebih dari separuh hari', 2, 3),
  ('Hampir setiap hari', 3, 4)
) AS o(text, val, ord)
WHERE q.assessment_id = 2;

INSERT INTO assessment_score_ranges (assessment_id, min_score, max_score, category_label, result_message) VALUES
(2, 0, 4, 'Minimal', 'Gejala kecemasan kamu minimal. Pertahankan kebiasaan baikmu.'),
(2, 5, 9, 'Ringan', 'Ada indikasi kecemasan ringan. Coba teknik relaksasi atau kelola waktu istirahatmu.'),
(2, 10, 14, 'Sedang', 'Gejala kecemasan di level sedang. Pertimbangkan bicara dengan konselor.'),
(2, 15, 21, 'Berat', 'Gejala kecemasan cukup berat. Disarankan berkonsultasi dengan profesional kesehatan mental.');

-- ============================================
-- 3. Student Wellness Check — kuesioner custom tim
-- Bukan instrumen klinis tervalidasi; dikembangkan untuk konteks
-- keseharian mahasiswa sebagai pelengkap PHQ-9/GAD-7.
-- ============================================
INSERT INTO assessments (code, title, instruction, source) VALUES
('wellness_check', 'Student Wellness Check',
 'Dalam seminggu terakhir...',
 'Instrumen internal tim (bukan alat diagnosis klinis)');

INSERT INTO assessment_questions (assessment_id, question_text, order_number, is_sensitive) VALUES
(3, 'Seberapa sering kamu merasa sulit tidur atau insomnia?', 1, false),
(3, 'Seberapa sering kamu merasa kewalahan dengan tugas kuliah/deadline?', 2, false),
(3, 'Seberapa sering kamu melewatkan waktu makan karena sibuk atau tidak nafsu makan?', 3, false),
(3, 'Seberapa sering kamu merasa tidak sempat olahraga atau gerak badan?', 4, false),
(3, 'Seberapa sering kamu merasa capek/lemas meskipun sudah istirahat?', 5, false),
(3, 'Seberapa sering kamu menghindari ngobrol/kumpul sama teman karena malas atau capek duluan?', 6, false),
(3, 'Seberapa sering kamu merasa susah rileks atau susah "mematikan" pikiran soal tugas?', 7, false);

INSERT INTO assessment_options (question_id, option_text, score_value, order_number)
SELECT q.id, o.text, o.val, o.ord
FROM assessment_questions q
CROSS JOIN (VALUES
  ('Tidak pernah', 0, 1),
  ('Kadang-kadang', 1, 2),
  ('Sering', 2, 3),
  ('Hampir selalu', 3, 4)
) AS o(text, val, ord)
WHERE q.assessment_id = 3;

INSERT INTO assessment_score_ranges (assessment_id, min_score, max_score, category_label, result_message) VALUES
(3, 0, 8, 'Baik', 'Kondisimu terlihat cukup baik minggu ini. Terus jaga ritme ini ya.'),
(3, 9, 16, 'Perlu perhatian', 'Ada beberapa tanda kelelahan/stres. Coba luangkan waktu istirahat & self-care lebih.'),
(3, 17, 21, 'Disarankan konsultasi', 'Tanda kelelahan cukup tinggi. Pertimbangkan bicara dengan konselor kampus atau coba isi PHQ-9/GAD-7 untuk gambaran lebih lengkap.');