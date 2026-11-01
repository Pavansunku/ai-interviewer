import { createContext, useContext, useReducer } from 'react'

const initialState = {
  candidate: {
    name: '',
    role: '',
    experience: '',
    difficulty: '',
    questionCount: 10,
  },
  sessionId: null,
  welcomeMessage: '',
  totalQuestions: 0,
  currentQuestion: null,
  currentQuestionNumber: 0,
  questionResults: [],
  report: null,
  isLoading: false,
  error: null,
}

// eslint-disable-next-line react-refresh/only-export-components -- action names live beside the reducer
export const ACTIONS = {
  SET_CANDIDATE: 'SET_CANDIDATE',
  START_SESSION: 'START_SESSION',
  SET_QUESTION: 'SET_QUESTION',
  ADD_RESULT: 'ADD_RESULT',
  SET_REPORT: 'SET_REPORT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
}

function interviewReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CANDIDATE:
      return { ...state, candidate: { ...state.candidate, ...action.payload } }

    case ACTIONS.START_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        welcomeMessage: action.payload.welcomeMessage,
        totalQuestions: action.payload.totalQuestions,
        currentQuestion: action.payload.firstQuestion,
        currentQuestionNumber: 1,
        questionResults: [],
        report: null,
        error: null,
      }

    case ACTIONS.SET_QUESTION:
      return {
        ...state,
        currentQuestion: action.payload,
        currentQuestionNumber: state.currentQuestionNumber + 1,
      }

    case ACTIONS.ADD_RESULT:
      return {
        ...state,
        questionResults: [...state.questionResults, action.payload],
      }

    case ACTIONS.SET_REPORT:
      return { ...state, report: action.payload }

    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }

    case ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}

const InterviewContext = createContext(null)

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState)

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useInterview() {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}
