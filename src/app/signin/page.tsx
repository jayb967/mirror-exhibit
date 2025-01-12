import SignInForm from '@/components/auth/SignInForm'
import HeaderFive from '@/layouts/headers/HeaderFive'
import FooterOne from '@/layouts/footers/FooterOne'

export default function SignIn() {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <SignInForm />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  )
}