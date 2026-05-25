import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { LuSparkles } from 'react-icons/lu';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useRegisterMutation } from '../../../store/api/authApi';
import { useSeedOrdersMutation } from '../../../store/api/ordersApi';
import { loginSuccess } from '../../../store/slices/authSlice';
import { ROUTE_CONST } from '../../../routes/routeConstant';

const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
});

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [register] = useRegisterMutation({ fixedCacheKey: 'register' });
    const [seedOrders] = useSeedOrdersMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSeedOrders = async (token) => {
        seedOrders({ token });
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { confirmPassword, ...payload } = values;
            const res = await register(payload).unwrap();
            dispatch(loginSuccess({ user: res.user, token: res.token }));
            toast.success('Account created Successfully 🎉');
            seedOrders(res.token);
        } catch (err) {
            if (err?.name === 'AbortError' || err?.message === 'Aborted') return;
            const message = err?.data?.error
                || err?.data?.message
                || err?.error
                || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = (touched, error) => [
        'w-full rounded-[10px] border-[1.5px] bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none',
        'placeholder:text-gray-400',
        'transition-[border-color,box-shadow,background-color] duration-200',
        'focus:border-[#3b6ef8] focus:bg-white focus:ring-3 focus:ring-[#3b6ef8]/12',
        touched && error
            ? 'border-red-500 focus:ring-red-500/12'
            : 'border-gray-200',
    ].join(' ');

    return (
        <>
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6fa] py-10">

                {/* Blobs */}
                <div className="pointer-events-none absolute -top-30 -left-35 size-105 rounded-full bg-[#c7d9ff] opacity-45 blur-[80px]" />
                <div className="pointer-events-none absolute -right-25 -bottom-25 size-85 rounded-full bg-[#e0d4ff] opacity-45 blur-[80px]" />

                {/* Card */}
                <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/80 bg-white px-10 pt-11 pb-9 shadow-[0_8px_48px_rgba(59,110,248,0.10),0_1px_3px_rgba(0,0,0,0.06)]">

                    {/* Brand mark */}
                    <div className="mb-6 flex size-12 items-center justify-center rounded-[14px] bg-linear-to-br from-[#3b6ef8] to-[#7c5cfc]">
                        <LuSparkles className="text-xl text-white" />
                    </div>

                    <h1 className="mb-1 text-[28px] leading-tight font-extrabold tracking-tight text-gray-900">
                        Create account
                    </h1>
                    <p className="mb-7 text-sm text-gray-500">Let's get you set up in seconds.</p>

                    <Formik
                        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form className="flex flex-col gap-[18px]" noValidate>

                                {/* Full Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="name" className="text-[13px] font-medium tracking-[0.01em] text-gray-700">
                                        Full Name
                                    </label>
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        className={inputClass(touched.name, errors.name)}
                                    />
                                    <ErrorMessage name="name">
                                        {msg => <span className="text-xs text-red-500">{msg}</span>}
                                    </ErrorMessage>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-[13px] font-medium tracking-[0.01em] text-gray-700">
                                        Email
                                    </label>
                                    <Field
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className={inputClass(touched.email, errors.email)}
                                    />
                                    <ErrorMessage name="email">
                                        {msg => <span className="text-xs text-red-500">{msg}</span>}
                                    </ErrorMessage>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="password" className="text-[13px] font-medium tracking-[0.01em] text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Field
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            className={`${inputClass(touched.password, errors.password)} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 flex cursor-pointer items-center text-gray-400 transition-colors duration-150 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password">
                                        {msg => <span className="text-xs text-red-500">{msg}</span>}
                                    </ErrorMessage>
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="confirmPassword" className="text-[13px] font-medium tracking-[0.01em] text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Field
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            className={`${inputClass(touched.confirmPassword, errors.confirmPassword)} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(v => !v)}
                                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 flex cursor-pointer items-center text-gray-400 transition-colors duration-150 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword">
                                        {msg => <span className="text-xs text-red-500">{msg}</span>}
                                    </ErrorMessage>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={[
                                        'mt-1.5 flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px]',
                                        'bg-linear-to-br from-[#3b6ef8] to-[#7c5cfc] text-[15px] font-semibold text-white',
                                        'shadow-[0_4px_18px_rgba(59,110,248,0.30)]',
                                        'transition-[opacity,transform,box-shadow] duration-150',
                                        'hover:not-disabled:opacity-90 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_6px_24px_rgba(59,110,248,0.38)]',
                                        'active:not-disabled:translate-y-0',
                                        'disabled:cursor-not-allowed disabled:opacity-65',
                                    ].join(' ')}
                                >
                                    {isSubmitting
                                        ? <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                        : 'Create Account'
                                    }
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <p className="mt-6 text-center text-[13.5px] text-gray-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate(ROUTE_CONST.LOGIN_PAGE)}
                            className="cursor-pointer font-semibold text-[#3b6ef8] transition-colors duration-150 hover:text-[#2450d6] hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Register;