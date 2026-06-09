// JSON-serializable presets for the Schema Studio. The studio parses raw JSON
// into a schema, so these intentionally avoid `compute` functions (which can't
// be expressed in JSON). Dynamic-behavior recipes live in the docs as TS.

export interface StudioPreset {
	id: string;
	label: string;
	json: string;
}

const signup: StudioPreset = {
	id: 'signup',
	label: 'Sign up',
	json: `{
  "title": "Create your account",
  "groups": [
    {
      "layout": "grid",
      "gridCols": 2,
      "questions": [
        { "key": "firstName", "label": "First name", "control": "text",
          "validators": { "required": true, "minLength": 2 } },
        { "key": "lastName", "label": "Last name", "control": "text",
          "validators": { "required": true } }
      ]
    },
    {
      "questions": [
        { "key": "email", "label": "Email", "control": "email",
          "placeholder": "you@example.com",
          "validators": { "required": true, "email": true } },
        { "key": "password", "label": "Password", "control": "text",
          "inputType": "password",
          "validators": { "required": true, "minLength": 8 } },
        { "key": "terms", "label": "Terms", "control": "checkbox",
          "checkboxLabel": "I agree to the terms of service",
          "validators": { "required": true } }
      ]
    }
  ]
}`,
};

const survey: StudioPreset = {
	id: 'survey',
	label: 'Survey',
	json: `{
  "title": "Product feedback",
  "description": "Tell us what you think.",
  "groups": [
    {
      "questions": [
        { "key": "role", "label": "Your role", "control": "radioGroup",
          "options": [
            { "value": "eng", "label": "Engineer" },
            { "value": "design", "label": "Designer" },
            { "value": "pm", "label": "Product manager" }
          ],
          "validators": { "required": true } },
        { "key": "features", "label": "Features you use", "control": "checkboxList",
          "showSelectAll": true,
          "options": [
            { "value": "forms", "label": "Forms" },
            { "value": "wizard", "label": "Wizards" },
            { "value": "validation", "label": "Validation" }
          ] },
        { "key": "rating", "label": "Rating (1-10)", "control": "number",
          "validators": { "min": 1, "max": 10 } },
        { "key": "comments", "label": "Comments", "control": "textarea", "rows": 4 }
      ]
    }
  ]
}`,
};

const contact: StudioPreset = {
	id: 'contact',
	label: 'Contact',
	json: `{
  "title": "Contact us",
  "groups": [
    {
      "layout": "grid",
      "gridCols": 2,
      "questions": [
        { "key": "name", "label": "Name", "control": "text",
          "validators": { "required": true } },
        { "key": "email", "label": "Email", "control": "email",
          "validators": { "required": true, "email": true } }
      ]
    },
    {
      "questions": [
        { "key": "topic", "label": "Topic", "control": "dropdown",
          "placeholder": "Choose a topic",
          "options": [
            { "value": "sales", "label": "Sales" },
            { "value": "support", "label": "Support" },
            { "value": "other", "label": "Other" }
          ],
          "validators": { "required": true } },
        { "key": "message", "label": "Message", "control": "textarea", "rows": 5,
          "validators": { "required": true, "minLength": 20 } }
      ]
    }
  ]
}`,
};

export const studioPresets: StudioPreset[] = [signup, survey, contact];
