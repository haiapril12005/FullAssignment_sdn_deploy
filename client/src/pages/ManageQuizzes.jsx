import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createQuiz, deleteQuiz, fetchQuizzes, updateQuiz } from '../store/quizSlice';
import { fetchQuestions } from '../store/questionSlice';

const emptyForm = { title: '', description: '', questions: [] };

export default function ManageQuizzes() {
  const dispatch = useDispatch();
  const quizzes = useSelector((s) => s.quizzes);
  const questions = useSelector((s) => s.questions.items);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Always reload: questions may have been added / deleted on the other page
  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchQuestions());
  }, [dispatch]);

  const toggleQuestion = (id) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.includes(id) ? f.questions.filter((q) => q !== id) : [...f.questions, id],
    }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Quiz title is required');
    setFormError('');
    const payload = { title: form.title.trim(), description: form.description.trim(), questions: form.questions };
    setSaving(true);
    const result = await dispatch(editingId ? updateQuiz({ id: editingId, ...payload }) : createQuiz(payload));
    setSaving(false);
    if (!result.error) resetForm();
  };

  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      questions: quiz.questions.map((q) => q._id),
    });
    setEditingId(quiz._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (quiz) => {
    if (window.confirm(`Delete quiz "${quiz.title}"?`)) {
      dispatch(deleteQuiz(quiz._id));
      if (editingId === quiz._id) resetForm();
    }
  };

  return (
    <div>
      <h2 className="mb-3">Quizzes</h2>

      <div className="card mb-4">
        <div className="card-body">
          {(formError || quizzes.error) && <div className="alert alert-danger py-2">{formError || quizzes.error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label htmlFor="title" className="col-sm-2 col-form-label">
                Title:
              </label>
              <div className="col-sm-10">
                <input
                  id="title"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>
            <div className="row mb-3">
              <label htmlFor="description" className="col-sm-2 col-form-label">
                Description:
              </label>
              <div className="col-sm-10">
                <input
                  id="description"
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Questions:</label>
              <div className="col-sm-10">
                {questions.length === 0 && <p className="text-muted mb-0 pt-2">No questions in the bank yet.</p>}
                <div style={{ maxHeight: 260, overflowY: 'auto' }} className="border rounded p-2">
                  {questions.map((q) => (
                    <div className="form-check" key={q._id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`q-${q._id}`}
                        checked={form.questions.includes(q._id)}
                        onChange={() => toggleQuestion(q._id)}
                      />
                      <label className="form-check-label" htmlFor={`q-${q._id}`}>
                        {q.text}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="form-text">{form.questions.length} selected</div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
                {editingId ? 'Update Quiz' : 'Add Quiz'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="list-group">
        {quizzes.items.map((quiz) => (
          <div className="list-group-item p-3" key={quiz._id}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h4 className="mb-1">{quiz.title}</h4>
                <p className="text-muted mb-1">{quiz.description}</p>
                <span className="badge text-bg-secondary">{quiz.questions.length} questions</span>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-warning" onClick={() => handleEdit(quiz)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(quiz)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
