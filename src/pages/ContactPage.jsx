import React, { useRef, useState } from "react";

const fields = [
  ["fullName", "Full Name", "text"],
  ["subject", "Subject", "text"],
  ["email", "Email", "email"],
  ["body", "Message", "textarea"],
];
export function validateContact(values) {
  const errors = {};
  for (const [key, label] of fields) {
    const value = values[key].trim();
    if (
      key === "email"
        ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
        : value.length < 3
    )
      errors[key] =
        key === "email"
          ? "Enter a valid email address."
          : `${label} must be at least 3 characters long.`;
  }
  return errors;
}
export default function ContactPage() {
  const [values, setValues] = useState({
    fullName: "",
    subject: "",
    email: "",
    body: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    setSuccess(false);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      formRef.current.elements.namedItem(first)?.focus();
      return;
    }
    setSuccess(true);
  };
  return (
    <section className="container page-section contact-page">
      <div>
        <p className="eyebrow">LET’S TALK</p>
        <h1>
          A question?
          <br />
          You’re in the right place.
        </h1>
        <p className="muted">
          This contact form is part of a portfolio demo. You can try the form,
          but messages are not delivered.
        </p>
      </div>
      <form ref={formRef} noValidate onSubmit={submit} className="contact-form">
        {success && (
          <p className="notice success" role="status">
            Your message passed validation. This is a demo, so it has not been
            sent.
          </p>
        )}
        {fields.map(([key, label, type]) => (
          <div className="form-field" key={key}>
            <label htmlFor={key}>{label}</label>
            {type === "textarea" ? (
              <textarea
                id={key}
                name={key}
                rows="5"
                value={values[key]}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }));
                  setSuccess(false);
                }}
                required
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
              />
            ) : (
              <input
                id={key}
                name={key}
                type={type}
                autoComplete={
                  key === "fullName"
                    ? "name"
                    : key === "email"
                      ? "email"
                      : undefined
                }
                value={values[key]}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }));
                  setSuccess(false);
                }}
                required
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
              />
            )}
            {errors[key] && (
              <p className="field-error" id={`${key}-error`}>
                {errors[key]}
              </p>
            )}
          </div>
        ))}
        <button className="button" type="submit">
          Preview message
        </button>
      </form>
    </section>
  );
}
