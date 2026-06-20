
import Navbar from '@/shared/ui/organisms/navigation/Navbar'
import Footer from '@/shared/ui/organisms/navigation/Footer'
import UserSignUp from '@/features/auth/components/UserSignUp'
const SignUp = () => {
  return (
    <div>
      <Navbar/>
      <UserSignUp/>
      <Footer/>
    </div>
  )
}

export default SignUp
