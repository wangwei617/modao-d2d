export function Greeting() {
    return (
        <div className="text-center mb-8 select-none">
            <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-500 font-medium">产品团队</span>
                <div className="relative">
                    <span className="gradient-text font-bold text-lg">超级智能体</span>
                    <svg className="absolute -top-1 -right-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="16"
                        height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">下午好，我能如何帮助您</h1>
        </div>
    );
}
