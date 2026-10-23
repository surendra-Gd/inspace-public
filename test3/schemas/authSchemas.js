import * as yup from "yup";


const usernamePattern = new RegExp(/^(?=.*[a-z])[a-z0-9._]{6,20}$/);
const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const namePattern = /^(?!.*['";\\*]).{5,20}$/;
const statusPattern = /^(?!.*['";\\*])[\s\S]{1,100}$/;

const textPattern = /^(?!.*[;\\*])[\s\S]{1,720}$/;
const commentPattern = /^(?!.*[;\\*])[\s\S]{1,720}$/;
const replyPattern = /^(?!.*[;\\*])[\s\S]{1,720}$/;
const textMessagePattern = /^(?!.*[;\\*])[\s\S]{1,720}$/;



const usernameError = "Username must have at least one lowercase letter[a-z] and can only include lowercase letters[a-z], numbers[0-9], dots [.], or underscores [_] eg:username1_2";
const passwordError = "Password must contain at least one digit[0-9], one lowercase letter[a-z], and one uppercase letter[A-Z] eg:Password123";
const nameError = "Name contains invalid characters and must be between 5 and 20 characters long.";
const statusError = "Status contains invalid characters";
const emailError = "Please enter a valid email";
const feedbackError = "Your feedback contains invalid characters or is too long";
const commentError = "Your comment contains invalid characters.";
const textError = "Your text contains invalid characters.";
const textMessageError = "Your text message contains invalid characters.";
const replyError = "Your reply contains invalid characters.";


export const usernameSchema = yup.object().shape({
    username: yup
        .string()
        .trim()
        .required("Username is required")
        .min(6, "Username must be at least 6 characters")
        .max(20, "Username must be at most 20 characters")
        .matches(usernamePattern, {message: usernameError}),
});

export const nameSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .min(5, "Name must be at least 5 characters")
        .max(20, "Maximum exceeded")
        .matches(namePattern, {message: nameError})
        .required("Name is Required"),
});

export const statusSchema = yup.object().shape({
    status: yup
        .string()
        .trim()
        .min(1, "Status must be at least 1 character")
        .max(100, "Maximum exceeded")
        .matches(statusPattern, {message: statusError})
        .required("Required"),
});

export const emailSchema = yup.object().shape({
    email: yup
        .string()
        .trim()
        .email("Please enter a valid email")
        .matches(emailPattern, { message: emailError })
        .required("Required"),
});

export const feedbackSchema = yup.object().shape({
    feedback: yup
        .string()
        .trim()
        .matches(/^[^<>]*.{1,200}$/, {message: feedbackError})
        .required("Please provide feedback."),
});

export const commentSchema = yup.object().shape({
    payload: yup.string()
        .required("Please provided valid comment.")
        .min(1, "Comment is too short. At least maintain 1 character.")
        .max(720, "Comment is too long. Please keep it under 720 characters.")
        .matches(commentPattern, {message: commentError})
});

export const replySchema = yup.object().shape({
    payload: yup.string()
        .required("Please provided valid reply.")
        .min(1, "Reply is too short. At least maintain 1 character.")
        .max(720, "Reply is too long. Please keep it under 720 characters.")
        .matches(replyPattern, {message: replyError})
});

export const textMessageSchema = yup.object().shape({
    message: yup.string()
        .required("Please provided valid text message.")
        .min(1, "Text Message is too short. At least maintain 1 character.")
        .max(720, "Text Message is too long. Please keep it under 720 characters.")
        .matches(textMessagePattern, {message: textMessageError})
});


export const textSchema = yup.object().shape({
    text: yup.string()
        .required("Please provided valid text")
        .min(1, "Text is too short. At least maintain 1 character.")
        .max(720, "Text is too long. Please keep it under 720 characters.")
        .matches(textPattern, {message: textError})
});



export const passwordSchema = yup.object().shape({
    password: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
});

export const signInSchema = yup.object().shape({
    username: yup
        .string()
        .trim()
        .required("Username is required")
        .min(6, "Username must be at least 6 characters")
        .max(20, "Username must be at most 20 characters")
        .matches(usernamePattern, {message: usernameError}),
    password: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
});

export const signUpSchema = yup.object().shape({
    email: yup
        .string()
        .trim()
        .email("Please enter a valid email")
        .matches(emailPattern, {message: emailError})
        .required("Required"),
    username: yup
        .string()
        .trim()
        .required("Username is required")
        .min(6, "Username must be at least 6 characters")
        .max(20, "Username must be at most 20 characters")
        .matches(usernamePattern, {message: usernameError}),
    name: yup
        .string()
        .trim()
        .min(5, "Name must be at least 5 characters")
        .max(20, "Maximum exceeded")
        .matches(namePattern, {message: nameError})
        .required("Required"),
    password: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
});

export const signupVerification = yup.object().shape({
    code: yup
        .string()
        .matches(/^\d{7}$/, { message: "Must be exactly 7 digits" })
        .required("This field is required"),
});

export const resetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
    confirmationPassword: yup
        .string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError})
        .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export const changePasswordSchema = yup.object().shape({
    currentPassword: yup
        .string()
        .trim()
        .required("Current Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
    newPassword: yup
        .string()
        .trim()
        .required("New Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError}),
    confirmationPassword: yup
        .string()
        .trim()
        .required("Confirm Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be at most 50 characters")
        .matches(passwordPattern, {message:passwordError})
        .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});