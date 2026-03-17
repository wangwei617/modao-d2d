// Exact replica of monolithic HTML's "精选案例" section
import { tr } from '@/pc-en/tr';

export function FeatureCards() {
    return (
        <div className="mb-12 w-full max-w-[1000px] mx-auto">
            <h3 className="text-md font-bold text-gray-800 mb-4 px-2">{tr('精选案例')}</h3>
            <div className="grid grid-cols-4 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="aspect-[16/10] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="SaaS"
                            className="w-full h-full object-cover mix-blend-multiply opacity-80"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/20 backdrop-blur-[2px]">
                            <span className="text-indigo-800 font-bold px-3 py-1 bg-white/60 rounded-full text-[10px] mb-1">{tr('网页端')}</span>
                            <p className="text-indigo-900 font-bold text-xs">{tr('SaaS业务控制台')}</p>
                        </div>
                    </div>
                    <h4 className="font-bold text-[13px] text-gray-800">{tr('SaaS落地页设计')}</h4>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="aspect-[16/10] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="App"
                            className="w-full h-full object-cover mix-blend-multiply opacity-80"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/20 backdrop-blur-[2px]">
                            <span className="text-emerald-800 font-bold px-3 py-1 bg-white/60 rounded-full text-[10px] mb-1">{tr('移动端')}</span>
                            <p className="text-emerald-900 font-bold text-xs">{tr('文旅一站式平台')}</p>
                        </div>
                    </div>
                    <h4 className="font-bold text-[13px] text-gray-800">{tr('古风数字景区App设计')}</h4>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer">
                    <div className="aspect-[16/10] bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="Ecommerce"
                            className="w-full h-full object-cover mix-blend-multiply opacity-80"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/20 backdrop-blur-[2px]">
                            <span className="text-orange-800 font-bold px-3 py-1 bg-white/60 rounded-full text-[10px] mb-1">{tr('移动端')}</span>
                            <p className="text-orange-900 font-bold text-xs">{tr('生鲜商城购物车')}</p>
                        </div>
                    </div>
                    <h4 className="font-bold text-[13px] text-gray-800">{tr('生鲜/电商APP原型')}</h4>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
                    <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="Education"
                            className="w-full h-full object-cover mix-blend-multiply opacity-80"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/20 backdrop-blur-[2px]">
                            <span className="text-blue-800 font-bold px-3 py-1 bg-white/60 rounded-full text-[10px] mb-1">{tr('网页端')}</span>
                            <p className="text-blue-900 font-bold text-xs">{tr('在线视频教学平台')}</p>
                        </div>
                    </div>
                    <h4 className="font-bold text-[13px] text-gray-800">{tr('在线教育界面设计')}</h4>
                </div>
            </div>
        </div>
    );
}
