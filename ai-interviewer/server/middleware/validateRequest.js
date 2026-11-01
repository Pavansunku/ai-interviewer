// Schema format: { fieldName: { required, type, enum } }
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`"${field}" is required.`);
        continue;
      }

      if (value !== undefined && rules.type && typeof value !== rules.type) {
        errors.push(`"${field}" must be of type ${rules.type}.`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`"${field}" must be one of: ${rules.enum.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(' ') });
    }

    next();
  };
}

const startSchema = {
  name: { required: true, type: 'string' },
  role: {
    required: true,
    type: 'string',
  },
  experience: {
    required: true,
    type: 'string',
  },
  difficulty: {
    required: true,
    type: 'string',
    enum: ['Easy', 'Medium', 'Hard'],
  },
  questionCount: { required: true, type: 'number' },
};

const answerSchema = {
  sessionId: { required: true, type: 'string' },
  questionId: { required: true, type: 'number' },
  question: { required: true, type: 'string' },
  answer: { required: true, type: 'string' },
};

const finishSchema = {
  sessionId: { required: true, type: 'string' },
};

module.exports = { validate, startSchema, answerSchema, finishSchema };
