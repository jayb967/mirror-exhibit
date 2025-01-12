import SignUpForm from '@/components/auth/SignUpForm'
import HeaderFive from '@/layouts/headers/HeaderFive'
import FooterOne from '@/layouts/footers/FooterOne'

export default function SignUp() {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <SignUpForm />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  )
}