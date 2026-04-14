import { useState, useCallback, type ChangeEvent } from 'react';
import { Camera, Check, ChevronRight, Upload, AlertCircle, RotateCcw, Info } from 'lucide-react';

// 模拟数据
const MOCK_RECOGNITION = {
  brand: "Adidas",
  series: "Yeezy",
  model: "Yeezy 500",
  colorway: "Blush",
  sku: "DB2908",
  releaseYear: "2018",
  confidence: 0.92,
};

const MOCK_DEFECTS = {
  overallGrade: "A",
  gradeNumeric: 8.3,
  details: [
    { area: "翻毛皮鞋面", status: "泛灰变脏", reversible: true, impact: "中" },
    { area: "网眼面料", status: "轻微泛黄", reversible: false, impact: "低" },
    { area: "中底边缘", status: "轻微氧化", reversible: false, impact: "低" },
    { area: "鞋型结构", status: "保持良好", reversible: null, impact: "无" },
  ],
  tip: "翻毛皮清洗后成色可提升至 S 级"
};

const MOCK_PRICING = {
  recommended: 255,
  range: { low: 217, high: 293 },
  tiers: [
    { label: "快速出", price: 230, time: "1-3天" },
    { label: "推荐", price: 255, time: "3-7天", recommended: true },
    { label: "高价", price: 280, time: "7-15天" },
  ],
  reference: { avg: 320, current: 220 }
};

export default function AIListingDemo() {
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);
  const [showCalc, setShowCalc] = useState(false);

  const steps = ["拍照", "识别", "评估", "估价", "挂售"];

  const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === 'string') setImage(result);
        setLoading(true);
        setTimeout(() => { setLoading(false); setStep(1); }, 1200);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const useDemo = () => {
    setImage("demo");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(1); }, 1200);
  };

  const next = () => {
    if (step < 4) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 600);
    }
  };

  const reset = () => {
    setStep(0);
    setImage(null);
    setSelectedTier(1);
    setShowCalc(false);
  };

  const impactColor = (impact: string) => {
    if (impact === "无") return "text-emerald-600";
    if (impact === "低") return "text-amber-600";
    if (impact === "中") return "text-orange-600";
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-5 h-12 flex items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">AI 快速挂售</span>
          {step > 0 && (
            <button onClick={reset} className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
              <RotateCcw size={14} /> 重来
            </button>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            {steps.map((_label, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                  i < step ? 'bg-slate-900 text-white' :
                  i === step ? 'bg-slate-900 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-px mx-1 transition-colors ${i < step ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">
            {steps.map((s, i) => (
              <span key={i} className={`text-[10px] ${i <= step ? 'text-slate-600' : 'text-slate-300'}`}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 py-6">
        
        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="animate-fade">
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="upload" />
            
            <label htmlFor="upload" className="relative block aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-colors overflow-hidden">
              {image ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  {image === "demo" ? (
                    <span className="text-slate-400 text-sm">Demo</span>
                  ) : (
                    <img src={image} alt="" className="max-w-full max-h-full object-contain" />
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <Camera size={24} className="text-slate-400" />
                  </div>
                  <p className="text-[15px] font-medium text-slate-700">拍照或上传</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">正面 + 鞋底角度最佳</p>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>

            <button onClick={useDemo} className="w-full mt-4 h-12 rounded-xl bg-slate-900 text-white text-[15px] font-medium hover:bg-slate-800 transition-colors">
              使用演示数据
            </button>
          </div>
        )}

        {/* Step 1: Recognition */}
        {step === 1 && (
          <div className="animate-fade">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">识别结果</span>
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {Math.round(MOCK_RECOGNITION.confidence * 100)}% 置信
                </span>
              </div>
              
              <h2 className="text-[22px] font-semibold text-slate-900 leading-tight">
                {MOCK_RECOGNITION.model}
              </h2>
              <p className="text-[15px] text-slate-500 mt-1">
                {MOCK_RECOGNITION.brand} · {MOCK_RECOGNITION.colorway} · {MOCK_RECOGNITION.releaseYear}
              </p>
              
              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[13px] text-slate-400">货号</span>
                <span className="text-[13px] font-mono text-slate-700">{MOCK_RECOGNITION.sku}</span>
              </div>
            </div>

            <button onClick={next} disabled={loading} className="w-full mt-5 h-12 rounded-xl bg-slate-900 text-white text-[15px] font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>确认 <ChevronRight size={18} /></>}
            </button>
          </div>
        )}

        {/* Step 2: Assessment */}
        {step === 2 && (
          <div className="animate-fade">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">成色评估</span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-[42px] font-bold text-slate-900 leading-none">{MOCK_DEFECTS.overallGrade}</span>
                <span className="text-[15px] text-slate-400">级 · {MOCK_DEFECTS.gradeNumeric}成新</span>
              </div>

              <div className="space-y-3">
                {MOCK_DEFECTS.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-slate-700">{d.area}</span>
                      {d.reversible !== null && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.reversible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {d.reversible ? '可恢复' : '不可逆'}
                        </span>
                      )}
                    </div>
                    <span className={`text-[13px] font-medium ${impactColor(d.impact)}`}>{d.status}</span>
                  </div>
                ))}
              </div>

              {MOCK_DEFECTS.tip && (
                <div className="mt-5 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
                  <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-amber-700">{MOCK_DEFECTS.tip}</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 flex items-start gap-3">
              <AlertCircle size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-slate-700">建议补拍鞋底</p>
                <p className="text-[12px] text-slate-400 mt-0.5">可获得更准确的成色评估</p>
              </div>
            </div>

            <button onClick={next} disabled={loading} className="w-full mt-5 h-12 rounded-xl bg-slate-900 text-white text-[15px] font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>生成估价 <ChevronRight size={18} /></>}
            </button>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="animate-fade">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">建议售价</span>
                <button onClick={() => setShowCalc(!showCalc)} className="text-[11px] text-slate-500 hover:text-slate-700">
                  {showCalc ? '收起' : '计算明细'}
                </button>
              </div>
              
              <div className="text-center py-4">
                <div className="text-[13px] text-slate-400 mb-1">¥{MOCK_PRICING.range.low} — {MOCK_PRICING.range.high}</div>
                <div className="text-[48px] font-bold text-slate-900 tracking-tight">¥{MOCK_PRICING.recommended}</div>
              </div>

              {showCalc && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-[13px] animate-fade">
                  <div className="flex justify-between"><span className="text-slate-400">基准价</span><span>¥500</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">× 成色系数</span><span>×0.645</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">× 稀缺系数</span><span>×0.95</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">- 瑕疵扣减</span><span className="text-red-500">-¥52</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-medium"><span>建议价</span><span>¥255</span></div>
                </div>
              )}

              <div className="mt-6 space-y-2">
                {MOCK_PRICING.tiers.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTier(i)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedTier === i ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTier === i ? 'border-slate-900' : 'border-slate-300'
                      }`}>
                        {selectedTier === i && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                      </div>
                      <div className="text-left">
                        <span className="text-[14px] font-medium text-slate-900">{t.label}</span>
                        {t.recommended && <span className="ml-2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded">推荐</span>}
                        <p className="text-[12px] text-slate-400">预计 {t.time}</p>
                      </div>
                    </div>
                    <span className="text-[18px] font-semibold text-slate-900">¥{t.price}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between text-[12px] text-slate-400">
                <span>近30天均价 ¥{MOCK_PRICING.reference.avg}</span>
                <span>最低在售 ¥{MOCK_PRICING.reference.current}</span>
              </div>
            </div>

            <button onClick={next} disabled={loading} className="w-full mt-5 h-12 rounded-xl bg-slate-900 text-white text-[15px] font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>确认价格 <ChevronRight size={18} /></>}
            </button>
          </div>
        )}

        {/* Step 4: Listing */}
        {step === 4 && (
          <div className="animate-fade">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                <Upload size={32} className="text-slate-300" />
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <span className="text-[11px] text-slate-400">标题</span>
                  <p className="text-[15px] font-medium text-slate-900 mt-1">Adidas Yeezy 500 Blush A成色</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400">成色</span>
                    <p className="text-[14px] text-slate-700 mt-1">A级 (8.3成新)</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">尺码</span>
                    <input type="text" placeholder="请输入" className="w-full text-[14px] text-slate-700 mt-1 outline-none border-b border-slate-200 focus:border-slate-900 pb-1 transition-colors" />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-500">售价</span>
                    <span className="text-[22px] font-bold text-slate-900">¥{MOCK_PRICING.tiers[selectedTier].price}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] text-slate-400">描述</span>
                  <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Yeezy 500 Blush，约8成新。翻毛皮有灰尘可清洗，网眼/中底轻微氧化，鞋型完好，无原盒。
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert('🎉 挂售成功！')}
              className="w-full mt-5 h-12 rounded-xl bg-slate-900 text-white text-[15px] font-medium hover:bg-slate-800 transition-colors"
            >
              发布
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-3">发布即同意服务协议</p>
          </div>
        )}
      </main>

      <style>{`
        .animate-fade { animation: fade 0.25s ease-out; }
        @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
