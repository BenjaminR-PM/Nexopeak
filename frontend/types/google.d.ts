declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (element: HTMLElement, config: GoogleButtonOptions) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleIdConfig {
  client_id: string
  callback: (response: GoogleIdResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  width?: string | number
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

interface GoogleIdResponse {
  credential: string
  select_by?: string
}

export {}