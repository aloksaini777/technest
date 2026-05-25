import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { LuSparkles } from 'react-icons/lu';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ROUTE_CONST } from '../../../routes/routeConstant';
import { useLoginMutation } from '../../../store/api/authApi';
import { loginSuccess } from '../../../store/slices/authSlice';

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [login] = useLoginMutation({ fixedCacheKey: 'login' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const res = await login(values).unwrap();
            dispatch(loginSuccess({ user: res.user, token: res.token }));
            toast.success('Signing you in…');
        } catch (err) {
            const message = err?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6fa]">

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
                        Sign in
                    </h1>
                    <p className="mb-7 text-sm text-gray-500">Good to see you again.</p>

                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form className="flex flex-col gap-[18px]" noValidate>

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
                                        className={[
                                            'w-full rounded-[10px] border-[1.5px] bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none',
                                            'placeholder:text-gray-400',
                                            'transition-[border-color,box-shadow,background-color] duration-200',
                                            'focus:border-[#3b6ef8] focus:bg-white focus:ring-3 focus:ring-[#3b6ef8]/12',
                                            touched.email && errors.email
                                                ? 'border-red-500 focus:ring-red-500/12'
                                                : 'border-gray-200',
                                        ].join(' ')}
                                    />
                                    <ErrorMessage name="email">
                                        {msg => <span className="text-xs text-red-500">{msg}</span>}
                                    </ErrorMessage>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-[13px] font-medium tracking-[0.01em] text-gray-700">
                                            Password
                                        </label>
                                    </div>

                                    <div className="relative flex items-center">
                                        <Field
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className={[
                                                'w-full rounded-[10px] border-[1.5px] bg-gray-50 py-2.5 pr-11 pl-3.5 text-sm text-gray-900 outline-none',
                                                'placeholder:text-gray-400',
                                                'transition-[border-color,box-shadow,background-color] duration-200',
                                                'focus:border-[#3b6ef8] focus:bg-white focus:ring-3 focus:ring-[#3b6ef8]/12',
                                                touched.password && errors.password
                                                    ? 'border-red-500 focus:ring-red-500/12'
                                                    : 'border-gray-200',
                                            ].join(' ')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 flex cursor-pointer items-center text-gray-400 transition-colors duration-150 hover:text-gray-600"
                                        >
                                            {showPassword
                                                ? <HiOutlineEyeOff size={18} />
                                                : <HiOutlineEye size={18} />
                                            }
                                        </button>
                                    </div>

                                    <ErrorMessage name="password">
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
                                        : 'Sign In'
                                    }
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <p className="mt-6 text-center text-[13.5px] text-gray-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate(ROUTE_CONST.REGISTER_PAGE)}
                            className="cursor-pointer font-semibold text-[#3b6ef8] transition-colors duration-150 hover:text-[#2450d6] hover:underline"
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;