export default function NameInput({ value, onChange, error }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="gomments-input-name">
        NAME {error && <span className="validation-error-text">{error}</span>}
      </label>
      <input
        type="text"
        id="gomments-input-name"
        name="name"
        placeholder="(optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'validation-error' : undefined}
      />
    </div>
  );
}
