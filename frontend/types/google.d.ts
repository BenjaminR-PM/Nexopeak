declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (element: HTMLElement | string, options: GoogleButtonOptions) => void
          prompt: () => void
          disableAutoSelect: () => void
          storeCredential: (credential: any, callback?: () => void) => void
          cancel: () => void
          revoke: (hint: string, callback?: () => void) => void
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
  context?: 'signin' | 'signup' | 'use'
  state_cookie_domain?: string
  ux_mode?: 'popup' | 'redirect'
  login_uri?: string
  native_callback?: string
  cancel_if_logged_in?: boolean
  prompt_parent_id?: string
  prompt_parent_id_google?: string
  prompt_parent_id_facebook?: string
  prompt_parent_id_github?: string
  prompt_parent_id_linkedin?: string
  prompt_parent_id_microsoft?: string
  prompt_parent_id_twitter?: string
  prompt_parent_id_yahoo?: string
  prompt_parent_id_apple?: string
  prompt_parent_id_amazon?: string
  prompt_parent_id_discord?: string
  prompt_parent_id_github?: string
  prompt_parent_id_google?: string
  prompt_parent_id_facebook?: string
  prompt_parent_id_linkedin?: string
  prompt_parent_id_microsoft?: string
  prompt_parent_id_twitter?: string
  prompt_parent_id_yahoo?: string
  prompt_parent_id_apple?: string
  prompt_parent_id_amazon?: string
  prompt_parent_id_discord?: string
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'rounded' | 'pill' | 'circle'
  logo_alignment?: 'left' | 'center'
  width?: string | number
  local?: string
  click_listener?: () => void
}

interface GoogleIdResponse {
  credential: string
  select_by: string
  client_id: string
  client_id_issued_at: number
  client_id_issued_at_google: number
  client_id_issued_at_facebook: number
  client_id_issued_at_github: number
  client_id_issued_at_linkedin: number
  client_id_issued_at_microsoft: number
  client_id_issued_at_twitter: number
  client_id_issued_at_yahoo: number
  client_id_issued_at_apple: number
  client_id_issued_at_amazon: number
  client_id_issued_at_discord: number
}

export {}
