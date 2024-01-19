import React from 'react';
import {useForm, Resolver, SubmitHandler, DefaultValues, FieldValues} from 'react-hook-form';

type FormProps<TFormValues extends FieldValues> = {
    defaultValues?: DefaultValues<TFormValues>;
    resolver?: Resolver<TFormValues>;
    children?: React.ReactNode;
    onSubmit: SubmitHandler<TFormValues>;
    formClass?: string;
};

const Form = <TFormValues extends Record<string, any> = Record<string, any>>
({
     defaultValues,
     resolver,
     children,
     onSubmit,
     formClass,
 }: FormProps<TFormValues>) => {
    /*
     * form methods
     */
    const methods = useForm<TFormValues>({ defaultValues, resolver });
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = methods;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={formClass} noValidate>
            {Array.isArray(children)
                ? children.map((child) => {
                    return child.props && child.props.name
                        ? React.createElement(child.type, {
                            ...{
                                ...child.props,
                                register,
                                key: child.props.name,
                                errors,
                                control,
                            },
                        })
                        : child;
                })
                : children}
        </form>
    );
};

export default Form;
