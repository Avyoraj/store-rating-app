import * as yup from 'yup';

// Password validation: 8-16 characters, at least one uppercase letter and one special character
const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .required('Password is required');

// Username validation: 3-20 characters (matches backend)
const usernameSchema = yup
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .required('Username is required');

// Address validation: max 400 characters
const addressSchema = yup
  .string()
  .max(400, 'Address must be at most 400 characters')
  .required('Address is required');

// Email validation
const emailSchema = yup
  .string()
  .email('Please enter a valid email')
  .required('Email is required');

// Login schema (matches backend expectations)
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required')
});

// Registration schema (matches backend expectations)
export const registerSchema = yup.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema
});

// Rating schema
export const ratingSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .required('Rating is required'),
  comment: yup.string().max(500, 'Comment must be at most 500 characters')
});
