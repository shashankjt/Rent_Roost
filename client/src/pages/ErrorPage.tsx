
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const ErrorPage = () => {
    const error = useRouteError();
    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        // error is type `ErrorResponse`
        errorMessage = error.statusText || error.data?.message || 'Unknown Error';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertCircle className="h-12 w-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Oops!</h1>
                <p className="text-gray-500 mb-6">Sorry, an unexpected error has occurred.</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <p className="text-red-700 font-mono text-sm break-all">
                        {errorMessage}
                    </p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 w-full"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
