import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, ChevronRight, User, Briefcase, BarChart2, Hash, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import Select from '../components/ui/Select.jsx'
import { useInterview } from '../context/InterviewContext.jsx'
import { ACTIONS } from '../context/InterviewContext.jsx'
import { startInterview } from '../api/interviewApi.js'

// Expanded, diverse job role groupings relevant to modern tech interviews
const roleGroups = [
  {
    group: 'Web & Software Engineering',
    options: [
      { value: 'Frontend Developer', label: 'Frontend Developer', sublabel: 'React, Vue, TypeScript, CSS architecture & performance' },
      { value: 'Backend Developer', label: 'Backend Developer', sublabel: 'Node.js, Go, Python, APIs, databases & microservices' },
      { value: 'Full Stack Developer', label: 'Full Stack Developer', sublabel: 'End-to-end web engineering across client and server' },
      { value: 'Mobile App Developer', label: 'Mobile App Developer', sublabel: 'iOS, Android, React Native & Flutter' },
      { value: 'Software Architect', label: 'Software Architect', sublabel: 'System architecture, high-level design & technical strategy' },
      { value: 'Embedded Systems Engineer', label: 'Embedded Systems Engineer', sublabel: 'C/C++, microcontrollers, RTOS & IoT' },
    ],
  },
  {
    group: 'AI, Machine Learning & Data',
    options: [
      { value: 'AI / ML Engineer', label: 'AI / ML Engineer', sublabel: 'Deep learning, PyTorch, model training & deployment' },
      { value: 'Data Scientist', label: 'Data Scientist', sublabel: 'Statistical modeling, predictive analytics & experimentation' },
      { value: 'Data Engineer', label: 'Data Engineer', sublabel: 'Pipelines, Spark, ETL, SQL/NoSQL & data warehousing' },
      { value: 'NLP & LLM Engineer', label: 'NLP & LLM Engineer', sublabel: 'Large language models, LangChain, RAG & prompt systems' },
      { value: 'Computer Vision Engineer', label: 'Computer Vision Engineer', sublabel: 'Image processing, object detection & OpenCV/TensorFlow' },
      { value: 'MLOps Engineer', label: 'MLOps Engineer', sublabel: 'Model monitoring, CI/CD for ML, feature stores & Kubeflow' },
    ],
  },
  {
    group: 'Cloud, Infrastructure & Security',
    options: [
      { value: 'DevOps Engineer', label: 'DevOps Engineer', sublabel: 'CI/CD pipelines, Docker, Kubernetes & Terraform' },
      { value: 'Cloud Solutions Architect', label: 'Cloud Solutions Architect', sublabel: 'AWS, Azure, GCP infrastructure & cloud-native systems' },
      { value: 'Site Reliability Engineer (SRE)', label: 'Site Reliability Engineer (SRE)', sublabel: 'Observability, incident response, SLOs & scalability' },
      { value: 'Cybersecurity Engineer', label: 'Cybersecurity Engineer', sublabel: 'Threat modeling, network security & penetration testing' },
    ],
  },
  {
    group: 'Quality, Systems & Leadership',
    options: [
      { value: 'QA Automation Engineer', label: 'QA Automation Engineer', sublabel: 'End-to-end testing, Playwright, Cypress & CI verification' },
      { value: 'Technical Product Manager', label: 'Technical Product Manager', sublabel: 'Product execution, technical specifications & roadmap' },
      { value: 'Engineering Manager', label: 'Engineering Manager', sublabel: 'Team leadership, architecture governance & delivery' },
      { value: 'Custom Role', label: 'Custom Technical Role', sublabel: 'Tailored questions for specialized tech stacks' },
    ],
  },
]

const experienceOptions = [
  { value: 'Fresher', label: 'Fresher / Entry-Level', sublabel: '0 - 1 years · Foundational concepts & academic projects' },
  { value: '1 Year', label: 'Junior Engineer', sublabel: '1 - 2 years · Production features & practical problem solving' },
  { value: '2 Years', label: 'Mid-Level Engineer', sublabel: '2 - 4 years · Independent delivery, trade-offs & optimization' },
  { value: '3+ Years', label: 'Senior Engineer', sublabel: '4+ years · System design, architecture & leadership' },
]

const difficultyOptions = [
  { value: 'Easy', label: 'Easy', sublabel: 'Fundamental principles, core syntax & warm-up questions' },
  { value: 'Medium', label: 'Medium', sublabel: 'Practical scenarios, framework internals & trade-offs' },
  { value: 'Hard', label: 'Hard', sublabel: 'Complex architecture, distributed systems & edge cases' },
]

const questionCountOptions = [
  { value: 5, label: '5 Questions', sublabel: '~15 minutes · Quick practice run' },
  { value: 10, label: '10 Questions', sublabel: '~30 minutes · Standard technical loop' },
  { value: 15, label: '15 Questions', sublabel: '~45 minutes · Deep dive evaluation' },
  { value: 20, label: '20 Questions', sublabel: '~60 minutes · Comprehensive interview' },
]

const SectionLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-3.5 h-3.5 text-zinc-400" />
    <span className="text-xs font-mono font-medium text-zinc-400 tracking-wider uppercase">{label}</span>
  </div>
)

export default function SetupPage() {
  const navigate = useNavigate()
  const { dispatch } = useInterview()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    role: '',
    customRoleTitle: '',
    experience: '',
    difficulty: '',
    questionCount: 10,
    resume: null,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Your name is required.'
    if (!form.role) e.role = 'Please select a target job role.'
    if (form.role === 'Custom Role' && !form.customRoleTitle.trim()) {
      e.customRoleTitle = 'Please specify your custom role title.'
    }
    if (!form.experience) e.experience = 'Please select your experience level.'
    if (!form.difficulty) e.difficulty = 'Please select a difficulty level.'
    if (!form.questionCount) e.questionCount = 'Please select the number of questions.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const effectiveRole = form.role === 'Custom Role' && form.customRoleTitle.trim()
      ? form.customRoleTitle.trim()
      : form.role

    setIsSubmitting(true)
    try {
      dispatch({
        type: ACTIONS.SET_CANDIDATE,
        payload: {
          ...form,
          role: effectiveRole,
        },
      })

      const response = await startInterview({
        name: form.name.trim(),
        role: effectiveRole,
        experience: form.experience,
        difficulty: form.difficulty,
        questionCount: form.questionCount,
      })

      dispatch({
        type: ACTIONS.START_SESSION,
        payload: {
          sessionId: response.data.sessionId,
          welcomeMessage: response.data.welcomeMessage,
          firstQuestion: response.data.firstQuestion,
          totalQuestions: response.data.totalQuestions,
        },
      })

      navigate('/interview')
    } catch (err) {
      toast.error(err.message || 'Failed to start interview. Is the server running?')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121214] border border-[#27272a] text-zinc-400 text-xs font-mono mb-3">
            <span>Interview Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
            Configure Your Session
          </h1>
          <p className="text-zinc-400 text-sm">
            Select your target position, seniority, and session parameters from the menus below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Candidate Name */}
          <Card>
            <SectionLabel icon={User} label="Candidate Name" />
            <Input
              id="candidate-name"
              placeholder="e.g. Alex Chen"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
            />
          </Card>

          {/* Target Role Dropdown */}
          <Card>
            <SectionLabel icon={Briefcase} label="Target Job Role" />
            <Select
              id="role-select"
              value={form.role}
              onChange={(val) => update('role', val)}
              options={roleGroups}
              placeholder="Select a job role (search or browse categories)…"
              searchable={true}
              error={errors.role}
            />

            {/* Custom role input when "Custom Role" is chosen */}
            {form.role === 'Custom Role' && (
              <div className="mt-3 pt-3 border-t border-[#27272a]">
                <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Specify Custom Role or Technology Focus
                </label>
                <Input
                  id="custom-role-title"
                  placeholder="e.g. Blockchain / Solidity Developer, Game Engine Programmer"
                  value={form.customRoleTitle}
                  onChange={(e) => update('customRoleTitle', e.target.value)}
                  error={errors.customRoleTitle}
                />
              </div>
            )}
          </Card>

          {/* Experience Level Dropdown */}
          <Card>
            <SectionLabel icon={BarChart2} label="Experience Level" />
            <Select
              id="experience-select"
              value={form.experience}
              onChange={(val) => update('experience', val)}
              options={experienceOptions}
              placeholder="Select your experience track…"
              error={errors.experience}
            />
          </Card>

          {/* Difficulty & Question Count (Side-by-side dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <Card>
              <SectionLabel icon={Layers} label="Difficulty Tier" />
              <Select
                id="difficulty-select"
                value={form.difficulty}
                onChange={(val) => update('difficulty', val)}
                options={difficultyOptions}
                placeholder="Select difficulty level…"
                error={errors.difficulty}
              />
            </Card>

            {/* Question Count */}
            <Card>
              <SectionLabel icon={Hash} label="Question Quota" />
              <Select
                id="question-count-select"
                value={form.questionCount}
                onChange={(val) => update('questionCount', val)}
                options={questionCountOptions}
                placeholder="Select question count…"
                error={errors.questionCount}
              />
            </Card>
          </div>

          {/* Resume Upload (optional) */}
          <Card>
            <SectionLabel icon={Upload} label="Candidate Resume (Optional)" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#27272a] rounded-lg p-5 text-center cursor-pointer hover:border-zinc-600 transition-colors"
            >
              {form.resume ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-zinc-200 font-mono">{form.resume.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      update('resume', null)
                    }}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs text-zinc-300 font-medium">Upload PDF or DOCX</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Adapts interview questions to your background</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => update('resume', e.target.files[0] || null)}
            />
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
            id="start-interview-btn"
          >
            Start Interview
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </main>
  )
}
