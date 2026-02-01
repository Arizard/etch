import { useState, useCallback } from 'react';
import NameInput from './NameInput';
import MessageInput from './MessageInput';
import SubmitReplyButton from './SubmitReplyButton';

export default function ReplyForm({ onSubmit }) {
  const [nameValue, setNameValue] = useState('');
  const [bodyValue, setBodyValue] = useState('');
  const [nameError, setNameError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleNameChange = useCallback((value) => {
    setNameValue(value);

    const [name, secret] = value.split('#');
    const errors = [];
    if (name?.length > 24) errors.push('max name length exceeded');
    if (secret?.length > 8) errors.push('max secret length exceeded');
    setNameError(errors.join(', '));
  }, []);

  const handleBodyChange = useCallback((value) => {
    setBodyValue(value);
    setBodyError(value.length > 500 ? 'max length exceeded' : '');
  }, []);

  const isValid =
    bodyValue.trim().length > 0 && nameError === '' && bodyError === '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [name, secret] = nameValue.split('#');
    const success = await onSubmit({
      name: name ?? '',
      secret: secret ?? '',
      body: bodyValue,
    });

    if (success) {
      setBodyValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    {expanded && <div className="row">
        <NameInput
          value={nameValue}
          onChange={handleNameChange}
          error={nameError}
        />
      </div>}
      <div className="row">
        <MessageInput
          value={bodyValue}
          focused={expanded}
          onFocus={() => setExpanded(true)}
          onChange={handleBodyChange}
          error={bodyError}
        />
      </div>
    {expanded && <div className="row">
        <SubmitReplyButton disabled={!isValid} />
      </div>
    }
      </form>
  );
}
