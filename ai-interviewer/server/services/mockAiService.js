
  const questionBanks = {
    Frontend: {
      Easy: [
        'Tell me about yourself and your frontend development journey.',
        'What is the difference between HTML, CSS, and JavaScript?',
        'Explain what responsive design means.',
        'What is the DOM and how does JavaScript interact with it?',
        'What are the differences between `let`, `const`, and `var`?',
        'What is Flexbox and when would you use it?',
        'Explain the box model in CSS.',
        'What is the difference between `==` and `===` in JavaScript?',
        'What is an event listener? Give an example.',
        'What is Git and why is it important for developers?',
        'What is the purpose of `alt` attributes on images?',
        'What are semantic HTML elements? Give three examples.',
        'What is `localStorage` and how is it different from `sessionStorage`?',
        'Explain what `async` and `await` do in JavaScript.',
        'What is the purpose of a `package.json` file?',
      ],
      Medium: [
        'Tell me about yourself and your most challenging frontend project.',
        'Explain the virtual DOM in React and its performance benefits.',
        'What are React hooks? Explain `useState` and `useEffect`.',
        'What is CSS-in-JS and what are its pros and cons?',
        'Explain closure in JavaScript with a real-world use case.',
        'What is the event loop in JavaScript? How does it affect async code?',
        'What is the difference between controlled and uncontrolled components in React?',
        'Explain code splitting and lazy loading in React.',
        'What is CORS and how do you handle it on the frontend?',
        'What are web accessibility (a11y) best practices?',
        'Explain the difference between SSR and CSR.',
        'What is memoization in React? When would you use `useMemo` and `useCallback`?',
        'How does the Context API work in React?',
        'What is a service worker and how does it enable PWAs?',
        'Explain the concept of debouncing and throttling.',
      ],
      Hard: [
        'Tell me about yourself and a technically complex problem you solved recently.',
        'How would you architect a large-scale React application for performance at scale?',
        'Explain micro-frontends: when to use them and their trade-offs.',
        'How would you implement a custom hook for complex server state management?',
        'Explain React reconciliation algorithm (Fiber) in depth.',
        'How would you implement real-time collaborative features in a web app?',
        'Design a component library from scratch — what decisions would you make?',
        'How do you approach optimizing Core Web Vitals for a React app?',
        'Explain advanced TypeScript patterns relevant to React development.',
        'How would you handle state management in a very large React app without Redux?',
        'How do you architect a white-label multi-tenant frontend?',
        'Explain tree shaking and how to ensure your code is properly tree-shaken.',
        'How would you implement a drag-and-drop feature from scratch?',
        'What strategies do you use for testing React applications at scale?',
        'How would you build an offline-first web application?',
      ],
    },
    Backend: {
      Easy: [
        'Tell me about yourself and what draws you to backend development.',
        'What is REST? What are the core principles of a RESTful API?',
        'What is the difference between GET, POST, PUT, and DELETE HTTP methods?',
        'What is a database? What is the difference between SQL and NoSQL?',
        'Explain what middleware is in the context of Express.js.',
        'What is JSON and why is it used in APIs?',
        'What is an HTTP status code? Give examples of common ones.',
        'What is environment variable and why should you use them?',
        'What is CRUD and how does it map to HTTP verbs?',
        'Explain what authentication and authorization mean.',
        'What is Node.js and what makes it different from browser JavaScript?',
        'What is npm and what is it used for?',
        'What is a callback function? How is it used in Node.js?',
        'Explain the concept of a session and a cookie.',
        'What is an ORM and why would you use one?',
      ],
      Medium: [
        'Tell me about yourself and your most impactful backend project.',
        'Explain JWT authentication: how does it work and what are its security considerations?',
        'What is database indexing and how does it improve query performance?',
        'Explain the difference between SQL JOINs: INNER, LEFT, RIGHT, FULL.',
        'What is rate limiting and why is it important for APIs?',
        'How do you handle errors globally in an Express.js application?',
        'Explain the N+1 query problem and how to solve it.',
        'What is caching and what caching strategies would you use for a REST API?',
        'How does Node.js handle concurrency despite being single-threaded?',
        'What are database transactions and when do you need them?',
        'Explain the concept of database normalization.',
        'What is WebSocket and when would you use it over REST?',
        'How would you validate and sanitize user input in an Express API?',
        'What is a message queue and when would you use one?',
        'Explain the difference between vertical and horizontal scaling.',
      ],
      Hard: [
        'Tell me about yourself and a high-scale backend system you have designed.',
        'Design a scalable URL shortener service — walk me through the architecture.',
        'How would you design a distributed rate limiter across multiple servers?',
        'Explain the CAP theorem and its practical implications for system design.',
        'How would you implement event sourcing and CQRS in a Node.js application?',
        'How do you ensure database migrations are safe in a production environment?',
        'Design a notification system that handles millions of users.',
        'Explain microservices communication patterns: REST vs. message queues vs. gRPC.',
        'How would you diagnose and fix a memory leak in a Node.js production server?',
        'What are the SOLID principles and how do you apply them in Node.js?',
        'How would you implement distributed tracing in a microservices architecture?',
        'Explain optimistic vs. pessimistic locking and when to use each.',
        'Design a real-time leaderboard system for a gaming platform.',
        'How would you implement multi-tenancy in a SaaS backend?',
        'Explain consistent hashing and its application in distributed systems.',
      ],
    },
    'Full Stack': {
      Easy: [
        'Tell me about yourself and your full stack development journey.',
        'What is the difference between the frontend and backend of a web application?',
        'Explain how a request travels from a browser to a server and back.',
        'What is CORS and why do browsers enforce it?',
        'What is the difference between a SPA and a traditional multi-page app?',
        'What tools do you use for API testing? (e.g., Postman, Insomnia)',
        'What is version control and why is it important?',
        'Explain what an API is and how frontend and backend communicate.',
        'What is the difference between client-side and server-side rendering?',
        'What is a `.env` file and why should it never be committed to Git?',
        'Explain the role of npm/yarn in full stack development.',
        'What is a build tool? What is the role of Webpack or Vite?',
        'What is deployment? What platforms have you used?',
        'Explain what HTTPS is and why it matters.',
        'What is Docker and what problem does it solve?',
      ],
      Medium: [
        'Tell me about yourself and a full stack project you are most proud of.',
        'How do you handle authentication across frontend and backend?',
        'Explain the flow of a JWT-based login system end-to-end.',
        'How do you structure a full stack project for maintainability?',
        'What is GraphQL? When would you prefer it over REST?',
        'How do you handle environment-specific configuration in full stack apps?',
        'Explain optimistic UI updates and when to use them.',
        'How do you approach error handling across the full stack?',
        'What is CI/CD and how have you implemented it?',
        'Explain the role of a reverse proxy like Nginx.',
        'How do you handle file uploads in a full stack application?',
        'What is the BFF (Backend for Frontend) pattern?',
        'How do you implement real-time features in a full stack app?',
        'What is containerization and how does Docker Compose help in development?',
        'How do you approach database design for a new full stack project?',
      ],
      Hard: [
        'Tell me about yourself and the most complex system you have built end-to-end.',
        'Design a full stack SaaS application from scratch — walk through every layer.',
        'How would you implement end-to-end type safety in a full stack TypeScript app?',
        'Explain how you would architect a real-time collaborative document editor.',
        'How would you handle breaking API changes without disrupting existing clients?',
        'Design a full stack observability system (logging, metrics, tracing).',
        'How do you approach performance optimization across the full stack?',
        'Explain the strangler fig pattern for migrating a monolith to microservices.',
        'How would you implement a multi-region deployment for a full stack app?',
        'Design an e-commerce platform with high availability requirements.',
        'How would you implement progressive enhancement in a full stack app?',
        'What is feature flagging and how do you implement it across the stack?',
        'How would you build a search feature that scales to millions of records?',
        'Explain how to implement zero-downtime deployments.',
        'How would you architect a full stack app that supports offline mode?',
      ],
    },
    AIML: {
      Easy: [
        'Tell me about yourself and what sparked your interest in AI/ML.',
        'What is the difference between supervised and unsupervised learning?',
        'What is overfitting? How do you prevent it?',
        'Explain what a neural network is in simple terms.',
        'What is the purpose of a training set, validation set, and test set?',
        'What is a feature in the context of machine learning?',
        'Explain what gradient descent is.',
        'What is the difference between classification and regression?',
        'What is a confusion matrix? What does it tell you?',
        'What is cross-validation and why is it used?',
        'Name three common machine learning algorithms.',
        'What is Python and why is it dominant in ML?',
        'What is the role of NumPy and Pandas in ML workflows?',
        'What is a hyperparameter? Give an example.',
        'Explain what a loss function is.',
      ],
      Medium: [
        'Tell me about yourself and an ML project that produced meaningful results.',
        'Explain how a convolutional neural network (CNN) works.',
        'What is transfer learning and when would you use it?',
        'Explain attention mechanisms and how they power transformers.',
        'What is the bias-variance trade-off?',
        'How do you handle imbalanced datasets in a classification problem?',
        'What is regularization (L1 vs. L2) and why is it used?',
        'Explain backpropagation in detail.',
        'What is feature engineering and why is it important?',
        'What are embeddings and how are they used in NLP?',
        'Explain the difference between batch, mini-batch, and stochastic gradient descent.',
        'What is BERT and how does it differ from GPT?',
        'How do you evaluate an NLP model?',
        'What is a recommendation system? Explain collaborative filtering.',
        'What is PCA and when would you use dimensionality reduction?',
      ],
      Hard: [
        'Tell me about a state-of-the-art ML system you have built or researched.',
        'Explain the transformer architecture in detail — self-attention, positional encoding, etc.',
        'How would you design an ML pipeline for production serving millions of requests?',
        'What are diffusion models and how do they differ from GANs?',
        'Explain RLHF (Reinforcement Learning from Human Feedback) and its role in LLMs.',
        'How would you approach continual learning to avoid catastrophic forgetting?',
        'Design an ML system for real-time fraud detection at scale.',
        'How do you handle data drift and model decay in production?',
        'Explain graph neural networks and their applications.',
        'How would you implement RAG (Retrieval-Augmented Generation)?',
        'What are mixture-of-experts models and their trade-offs?',
        'How would you approach multi-modal learning (vision + language)?',
        'Explain the mathematics behind variational autoencoders.',
        'How would you set up A/B testing for ML model updates in production?',
        'What is federated learning and why is it important for privacy?',
      ],
    },
    'Data Science': {
      Easy: [
        'Tell me about yourself and your journey into data science.',
        'What is the difference between data science, data analytics, and data engineering?',
        'What is exploratory data analysis (EDA)?',
        'What are the common data types you encounter in datasets?',
        'Explain what a p-value means.',
        'What is the difference between mean, median, and mode?',
        'What tools do you use for data visualization?',
        'What is SQL and why is it important for data scientists?',
        'What is a null value in a dataset? How do you handle it?',
        'Explain what a histogram tells you.',
        'What is a data pipeline?',
        'What is the difference between correlation and causation?',
        'What is normalization in the context of data preprocessing?',
        'What is a box plot and what does it show?',
        'What is the purpose of a scatter plot?',
      ],
      Medium: [
        'Tell me about yourself and a data science project that had business impact.',
        'Walk me through a complete data science project from raw data to insight.',
        'Explain the Central Limit Theorem and its importance.',
        'What is A/B testing and how do you design one correctly?',
        'What is time series forecasting? What models have you used?',
        'Explain the difference between Pearson and Spearman correlation.',
        'How do you detect and handle outliers in a dataset?',
        'What is feature selection? What techniques do you use?',
        'How do you approach a regression problem? Walk me through your steps.',
        'What is Bayesian statistics and how is it different from frequentist?',
        'Explain what a pivot table is and when you would use one.',
        'What is the difference between OLTP and OLAP?',
        'How do you communicate complex data findings to non-technical stakeholders?',
        'What is clustering? Compare K-Means and DBSCAN.',
        'What is data wrangling and what challenges have you faced with it?',
      ],
      Hard: [
        'Tell me about yourself and the most complex data problem you have solved.',
        'Design a data science system to predict customer churn for a SaaS company.',
        'How would you build a recommendation engine for an e-commerce platform?',
        'Explain causal inference methods and their applications.',
        'How do you validate that a predictive model is actually useful for the business?',
        'Design a real-time analytics dashboard — what data infrastructure would you use?',
        'How do you handle very large datasets that do not fit in memory?',
        'Explain survival analysis and when it is applicable.',
        'How would you design an experiment when randomization is not possible?',
        'What is graph analytics? How would you apply it to a social network?',
        'How do you ensure data quality and reliability in a data pipeline?',
        'Explain the differences between batch processing and stream processing.',
        'How would you build a real-time anomaly detection system?',
        'What is the difference between statistical significance and practical significance?',
        'How do you approach model interpretability for high-stakes decisions?',
      ],
    },
    DevOps: {
      Easy: [
        'Tell me about yourself and what drew you to DevOps.',
        'What is DevOps and what problem does it solve?',
        'What is the difference between DevOps and traditional IT operations?',
        'What is a CI/CD pipeline? Explain each step.',
        'What is Docker and what problem does it solve?',
        'What is the purpose of version control in DevOps?',
        'What is infrastructure as code (IaC)?',
        'What is a load balancer and why is it used?',
        'What is the difference between a container and a virtual machine?',
        'What is Kubernetes at a high level?',
        'Explain what a deployment is in a software context.',
        'What is monitoring and why is it important in production?',
        'What is a reverse proxy? Give an example.',
        'What is SSH and how is it used in DevOps?',
        'What is the purpose of environment variables in DevOps?',
      ],
      Medium: [
        'Tell me about yourself and a DevOps improvement you made that had real impact.',
        'Explain the key components of a production-grade CI/CD pipeline.',
        'How does Kubernetes handle container orchestration? Explain pods, services, and deployments.',
        'What is the difference between Terraform and Ansible?',
        'How do you implement zero-downtime deployments?',
        'Explain blue-green deployment vs. canary deployment.',
        'What is Helm and how does it simplify Kubernetes management?',
        'How do you secure secrets in a CI/CD pipeline?',
        'What is observability? Explain the three pillars: logs, metrics, and traces.',
        'How would you set up auto-scaling for a web application?',
        'What is GitOps and how does it differ from traditional CD?',
        'How do you handle rollbacks in a production deployment?',
        'Explain the concept of immutable infrastructure.',
        'What is a service mesh and when would you use one?',
        'How do you manage Kubernetes RBAC?',
      ],
      Hard: [
        'Tell me about yourself and the most complex infrastructure you have designed or managed.',
        'Design a multi-region, highly available infrastructure for a global SaaS product.',
        'How would you implement a disaster recovery plan with near-zero RTO/RPO?',
        'Explain how you would set up a secure, production-grade Kubernetes cluster on AWS.',
        'How would you implement GitOps with ArgoCD at scale?',
        'Design a cost-optimized cloud architecture for a startup with unpredictable traffic.',
        'How would you implement a secrets management system for a large organization?',
        'Explain how you would architect a Kubernetes-based ML training pipeline.',
        'How do you implement compliance as code in a regulated environment?',
        'How would you migrate a legacy monolith to a containerized microservices architecture?',
        'Explain how to set up distributed tracing with OpenTelemetry.',
        'How do you approach capacity planning for a new service?',
        'Design a chaos engineering program for a critical financial system.',
        'How would you implement a self-healing infrastructure?',
        'Explain the trade-offs between managed Kubernetes (EKS, GKE) and self-managed.',
      ],
    },
    Custom: {
      Easy: [
        'Tell me about yourself and your professional background.',
        'What are your core technical skills?',
        'What kind of projects have you worked on?',
        'How do you approach learning new technologies?',
        'What is your preferred development environment and why?',
        'Describe a project you are most proud of.',
        'What soft skills do you bring to a development team?',
        'How do you handle tight deadlines?',
        'What is your experience with version control systems?',
        'Where do you see yourself in five years?',
        'What motivates you as a developer?',
        'How do you stay up to date with industry trends?',
        'What is your preferred way to collaborate with a team?',
        'Describe your debugging process.',
        'What is a recent technology you have explored?',
      ],
      Medium: [
        'Tell me about yourself and a technically challenging project you delivered.',
        'Describe your most complex technical problem and how you solved it.',
        'How do you approach system design for a new project?',
        'Walk me through your development workflow from ticket to deployment.',
        'How do you handle technical debt in a fast-moving team?',
        'Describe a time you had to mentor or help a junior developer.',
        'How do you approach code reviews?',
        'What is your experience with Agile methodologies?',
        'Describe a situation where you disagreed with a technical decision and how you handled it.',
        'How do you prioritize features when everything seems urgent?',
        'What strategies do you use for writing maintainable code?',
        'How do you handle working with legacy codebases?',
        'Describe a time you identified and fixed a production issue under pressure.',
        'How do you approach documentation in your projects?',
        'What is your experience with cross-functional collaboration?',
      ],
      Hard: [
        'Tell me about yourself and the most impactful system you have architected.',
        'How would you design a system for 10 million daily active users?',
        'Walk me through a complex architectural decision you made and its trade-offs.',
        'How do you approach driving technical excellence in an engineering team?',
        'Describe your experience with building platforms that others build on top of.',
        'How do you balance technical rigor with business speed?',
        'What is your approach to organizational technical strategy?',
        'Describe the most difficult performance problem you have investigated.',
        'How do you evaluate build vs. buy decisions?',
        'How do you approach risk management in software projects?',
        'Describe a time you drove a significant technical transformation.',
        'How do you mentor senior engineers to grow even further?',
        'What is your approach to incident management and post-mortems?',
        'How do you think about developer experience and productivity at scale?',
        'Describe your approach to open source contribution or community involvement.',
      ],
    },
  };


  const strengthTemplates = [
    'Clear and structured communication of ideas',
    'Good understanding of core concepts',
    'Practical examples provided to support the answer',
    'Demonstrated awareness of trade-offs',
    'Showed depth of knowledge on the subject',
    'Answer was well-organized and easy to follow',
    'Mentioned real-world application of concepts',
    'Showed problem-solving mindset',
    'Demonstrated familiarity with industry best practices',
    'Answer was concise and on-point',
  ];

  const weaknessTemplates = [
    'Could have provided more specific code examples',
    'Answer lacked depth on edge cases',
    'Some technical terminology was used incorrectly',
    'Could elaborate more on performance considerations',
    'Answer could benefit from a real-world scenario',
    'Missing mention of alternative approaches',
    'Could have connected the concept to broader system design',
    'Answer was slightly vague in parts',
    'Could strengthen with more specifics on implementation details',
    'Would benefit from mentioning trade-offs',
  ];

  const feedbackTemplates = [
    (score) =>
      score >= 80
        ? 'Excellent response! You demonstrated a strong command of the topic with clear, organized thinking. Keep up this level of detail.'
        : score >= 60
          ? 'Good answer overall. You covered the main points, but there is room to go deeper on some aspects. Focus on providing concrete examples from your experience.'
          : 'Your answer covered the basics, but needs more depth. Try to structure your responses using the STAR method and back up concepts with real-world examples.',
  ];


  function pickRandom(arr, count = 1) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return count === 1 ? shuffled[0] : shuffled.slice(0, count);
  }

  function generateScore(difficulty, answerLength) {
    const base = difficulty === 'Hard' ? 55 : difficulty === 'Medium' ? 65 : 70;
    const lengthBonus = Math.min(Math.floor(answerLength / 50), 20);
    const variance = Math.floor(Math.random() * 15) - 5;
    return Math.min(100, Math.max(20, base + lengthBonus + variance));
  }

  function getQuestionBank(role, difficulty) {
    if (questionBanks[role]?.[difficulty]) return questionBanks[role][difficulty];
    for (const key of Object.keys(questionBanks)) {
      if (role && key !== 'Custom' && role.toLowerCase().includes(key.toLowerCase()) && questionBanks[key]?.[difficulty]) {
        return questionBanks[key][difficulty];
      }
    }
    return questionBanks['Custom']?.[difficulty] || questionBanks['Custom']['Medium'];
  }

  function generateWelcomeAndFirstQuestion({ name, role, difficulty, questionCount }) {
    const bank = getQuestionBank(role, difficulty);
    const firstQuestion = bank[0];

    const welcomeMessage = `Welcome, ${name}! 👋 I'm your AI interviewer today. I'll be evaluating you for a **${role}** role at the **${difficulty}** level. We'll work through **${questionCount} questions** together. Please answer each question thoughtfully — there are no tricks, just a genuine conversation about your skills and experience. Let's begin!`;

    return {
      welcomeMessage,
      firstQuestion: { id: 1, text: firstQuestion },
    };
  }

  function evaluateAnswer({ role, difficulty, questionIndex, question, answer, totalQuestions }) {
    const bank = getQuestionBank(role, difficulty);
    const answerLength = answer?.trim().length || 0;
    const score = generateScore(difficulty, answerLength);
    const technicalAccuracy = Math.min(100, score + Math.floor(Math.random() * 10) - 5);
    const communication = Math.min(100, score + Math.floor(Math.random() * 12) - 6);

    const strengths = pickRandom(strengthTemplates, Math.random() > 0.5 ? 2 : 1);
    const weaknesses = pickRandom(weaknessTemplates, Math.random() > 0.5 ? 2 : 1);
    const feedback = feedbackTemplates[0](score);

    const nextQuestionIndex = questionIndex; // questionIndex is 0-based index of the NEXT question
    const isLastQuestion = nextQuestionIndex >= totalQuestions;

    const nextQuestion = isLastQuestion ? null : { id: nextQuestionIndex + 1, text: bank[nextQuestionIndex] || bank[nextQuestionIndex % bank.length] };

    return {
      evaluation: {
        score,
        technicalAccuracy,
        communication,
        strengths: Array.isArray(strengths) ? strengths : [strengths],
        weaknesses: Array.isArray(weaknesses) ? weaknesses : [weaknesses],
        feedback,
      },
      nextQuestion,
      isLastQuestion,
    };
  }

  function generateReport({ candidateName, role, difficulty, questionResults }) {
    const count = questionResults.length;
    if (count === 0) {
      return { overallScore: 0, technicalAccuracy: 0, communicationScore: 0, strengths: [], weaknesses: [], feedback: 'Interview data not available.', suggestedTopics: [] };
    }

    const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

    const overallScore = avg(questionResults.map((r) => r.score));
    const technicalAccuracy = avg(questionResults.map((r) => r.technicalAccuracy));
    const communicationScore = avg(questionResults.map((r) => r.communication));

    // Aggregate unique strengths and weaknesses
    const allStrengths = [...new Set(questionResults.flatMap((r) => r.strengths))].slice(0, 4);
    const allWeaknesses = [...new Set(questionResults.flatMap((r) => r.weaknesses))].slice(0, 4);

    const suggestedTopicsMap = {
      Frontend: ['React Performance Optimization', 'Advanced CSS Animations', 'Web Accessibility (a11y)', 'Testing with Vitest/Jest', 'TypeScript Advanced Types'],
      Backend: ['Distributed Systems Design', 'Database Query Optimization', 'API Security Best Practices', 'Message Queues & Async Patterns', 'Containerization with Docker'],
      'Full Stack': ['System Design Fundamentals', 'CI/CD Pipeline Setup', 'Database Design', 'Full Stack TypeScript', 'Cloud Deployment (AWS/GCP)'],
      AIML: ['Transformer Architecture', 'MLOps & Model Serving', 'Advanced NLP Techniques', 'Computer Vision', 'Reinforcement Learning'],
      'Data Science': ['Statistical Modeling', 'Advanced SQL', 'Time Series Analysis', 'Data Storytelling', 'Causal Inference'],
      DevOps: ['Kubernetes Advanced Patterns', 'GitOps with ArgoCD', 'Terraform & IaC', 'Observability & SRE', 'Security & Compliance'],
      Custom: ['System Design', 'Leadership & Communication', 'Technical Problem Solving', 'Architecture Patterns', 'Best Practices'],
    };

    const suggestedTopics = (suggestedTopicsMap[role] || suggestedTopicsMap['Custom']).slice(0, overallScore < 60 ? 5 : 3);

    let feedback;
    if (overallScore >= 80) {
      feedback = `Outstanding performance, ${candidateName}! You demonstrated exceptional technical knowledge and communication skills throughout the interview. You are well-prepared for a ${role} role at the ${difficulty} level. Focus on the suggested topics to reach senior-level mastery.`;
    } else if (overallScore >= 65) {
      feedback = `Good job, ${candidateName}! You showed solid foundational knowledge with room to grow. Your communication was generally clear, and you handled most questions well. Work on the suggested topics and practice explaining concepts with real-world examples to elevate your performance.`;
    } else if (overallScore >= 50) {
      feedback = `You covered some key areas, ${candidateName}, but there are clear gaps in technical depth that need attention. Focus on strengthening your fundamentals and practice articulating solutions more clearly. The suggested topics below are your priority areas.`;
    } else {
      feedback = `Thank you for completing the interview, ${candidateName}. The results show significant areas for improvement in both technical knowledge and communication. Don't be discouraged — use this as a baseline and work systematically through the suggested topics. Consistent practice will make a big difference.`;
    }

    return {
      overallScore,
      technicalAccuracy,
      communicationScore,
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      feedback,
      suggestedTopics,
    };
  }

  module.exports = { generateWelcomeAndFirstQuestion, evaluateAnswer, generateReport };
