export default function MessageInput({ value, onChange, error }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="gomments-reply-form-body">
        MESSAGE {error && <span className="validation-error-text">{error}</span>}
      </label>
      <textarea
        id="gomments-reply-form-body"
        name="body"
        placeholder="(max 500 characters)"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'validation-error' : undefined}
      />
    </div>
  );
}
