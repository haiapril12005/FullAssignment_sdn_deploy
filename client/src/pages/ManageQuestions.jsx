import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearQuestionError,
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  updateQuestion,
} from '../store/questionSlice';

const emptyForm = { text: '', options: ['', '', '', ''], correctAnswerIndex: 0, keywords: '' };

export default function ManageQuestions() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.questions);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const setOption = (i, value) => setForm((f) => ({ ...f, options: f.options.map((o, j) => (j === i ? value : o)) }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    dispatch(clearQuestionError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const options = form.options.map((o) => o.trim());
    const correctAnswerIndex = Number(form.correctAnswerIndex);

    // Client-side validation (the backend validates again)
    if (!form.text.trim()) return setFormError('Question text is required');
    if (options.some((o) => !o)) return setFormError('Please fill in all 4 options');
    if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return setFormError(`Correct answer index must be between 0 and ${options.length - 1}`);
    }
    setFormError('');

    const payload = {
      text: form.text.trim(),
      options,
      correctAnswerIndex,
      keywords: form.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    };

    setSaving(true);
    const action = editingId ? updateQuestion({ id: editingId, ...payload }) : createQuestion(payload);
    const result = await dispatch(action);
    setSaving(false);
    if (!result.error) resetForm();
  };

  const handleEdit = (q) => {
    const options = [...q.options];
    while (options.length < 4) options.push('');
    setForm({
      text: q.text,
      options: options.slice(0, 4),
      correctAnswerIndex: q.correctAnswerIndex,
      keywords: (q.keywords || []).join(', '),
    });
    setEditingId(q._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (q) => {
    if (window.confirm(`Delete "${q.text}"?`)) {
      dispatch(deleteQuestion(q._id));
      if (editingId === q._id) resetForm();
    }
  };

  return (
    <div>
      <h2 className="mb-3">Questions</h2>

      <div className="card mb-4">
        <div className="card-body">
          {(formError || error) && <div className="alert alert-danger py-2">{formError || error}</div>}
          {editingId && <div className="alert alert-warning py-2">Editing question - change the fields and click Update.</div>}
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label htmlFor="text" className="col-sm-2 col-form-label">
                Question Text:
              </label>
              <div className="col-sm-10">
                <input
                  id="text"
                  className="form-control"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Options:</label>
              <div className="col-sm-10">
                {form.options.map((option, i) => (
                  <div className="input-group mb-2" key={i}>
                    <span className="input-group-text">{i}</span>
                    <input
                      className="form-control"
                      value={option}
                      onChange={(e) => setOption(i, e.target.value)}
                      aria-label={`Option ${i}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="row mb-3">
              <label htmlFor="correct" className="col-sm-2 col-form-label">
                Correct Answer Index:
              </label>
              <div className="col-sm-10">
                <input
                  id="correct"
                  type="number"
                  min="0"
                  max="3"
                  className="form-control"
                  value={form.correctAnswerIndex}
                  onChange={(e) => setForm({ ...form, correctAnswerIndex: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label htmlFor="keywords" className="col-sm-2 col-form-label">
                Keywords:
              </label>
              <div className="col-sm-10">
                <input
                  id="keywords"
                  className="form-control"
                  placeholder="comma separated, e.g. capital, geography"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
                {editingId ? 'Update Question' : 'Add Question'}
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

      {status === 'loading' && items.length === 0 && (
        <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /></div>
      )}
      {status === 'succeeded' && items.length === 0 && <p className="text-muted">No questions yet.</p>}

      <div className="list-group">
        {items.map((q) => (
          <div className="list-group-item p-3 question-card" key={q._id}>
            <h4>{q.text}</h4>
            <ul className="mb-3">
              {q.options.map((option, i) => (
                <li key={i} className={i === q.correctAnswerIndex ? 'text-success fw-semibold' : ''}>
                  {option}
                  {i === q.correctAnswerIndex && ' ✓'}
                </li>
              ))}
            </ul>
            <div className="btn-group">
              <button type="button" className="btn btn-warning" onClick={() => handleEdit(q)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(q)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
