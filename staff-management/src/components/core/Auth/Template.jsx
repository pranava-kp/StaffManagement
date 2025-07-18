import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPassword from "./ForgotPassword";

function Template({ title, description1, description2, image, formType }) {
  // const { loading } = useSelector((state) => state.auth)
  const loading = false; // TO DELETE

  let FormComponent;
  switch (formType) {
    case "signup":
      FormComponent = SignupForm;
      break;
    case "forgotPassword":
      FormComponent = ForgotPassword;
      break;
    default:
      FormComponent = LoginForm;
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center patternBackground">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto w-11/12 max-w-[450px] md:mx-0 bg-blue-300 rounded-md bg-clip-padding backdrop-filter backdrop-blur-[9px] bg-opacity-20 border border-gray-100 p-6 relative shadow-2xl">
          <h1 className="text-[1.875rem] text-center font-semibold leading-[2.375rem] text-blue-800 ">
            {title}
          </h1>
          <FormComponent />
        </div>
      )}
    </div>
  );
}

export default Template;
