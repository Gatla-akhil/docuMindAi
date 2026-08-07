import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { downloadDocumentFile } from '../services/api';
import toast from 'react-hot-toast';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Target,
  Sparkles,
  Languages,
  CheckCircle2,
  Copy,
  Share2,
  Download,
  Percent,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  PiggyBank,
  Calculator,
  UploadCloud,
  FileText
} from 'lucide-react';

const FinancePage = () => {
  const navigate = useNavigate();

  // Financial Input State
  const [monthlyIncome, setMonthlyIncome] = useState(85000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(35000);
  const [monthlyEmi, setMonthlyEmi] = useState(22000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(150000);
  const [targetYearlyIncome, setTargetYearlyIncome] = useState(1800000);

  // Document Upload & Target Language
  const [financeFile, setFinanceFile] = useState(null);
  const [targetLang, setTargetLang] = useState('te');
  const [customNotes, setCustomNotes] = useState('Personal monthly budget, home loan EMI, living expenditures and 1-year target wealth goal.');

  // Calculation Results
  const [processing, setProcessing] = useState(false);
  const [financeResult, setFinanceResult] = useState(null);

  // Automatic Real-Time Financial Calculations
  const currentNetSavings = Math.max(0, monthlyIncome - monthlyExpenses - monthlyEmi);
  const monthlySavingsRate = monthlyIncome > 0 ? ((currentNetSavings / monthlyIncome) * 100).toFixed(1) : 0;
  
  const additionalMonthlyIncomeNeeded = Math.max(0, targetMonthlyIncome - monthlyIncome);
  const additionalYearlyIncomeNeeded = Math.max(0, targetYearlyIncome - (monthlyIncome * 12));
  
  // Approximate Monthly Interest Outflow (Assumes typical amortized loan proportion)
  const approxMonthlyInterest = Math.round(monthlyEmi * (interestRate / 15));
  const yearlyInterestPaid = approxMonthlyInterest * 12;

  const handleFinanceSubmit = async (e) => {
    e.preventDefault();

    setProcessing(true);
    toast.loading(`Calculating target wealth goals, EMI interest & translating into ${targetLang.toUpperCase()}...`);

    try {
      const fileName = financeFile ? financeFile.name : 'personal_finance_budget.txt';
      const fullNotes = `PERSONAL FINANCE & TARGET WEALTH CALCULATOR REQUEST:
Monthly Income: ₹${monthlyIncome}
Monthly Expenses: ₹${monthlyExpenses}
Monthly EMI: ₹${monthlyEmi} (Interest Rate: ${interestRate}% p.a.)
Current Net Savings: ₹${currentNetSavings}/month (Savings Rate: ${monthlySavingsRate}%)
Target Monthly Income: ₹${targetMonthlyIncome}/month
Target Yearly Income: ₹${targetYearlyIncome}/year
Required Additional Income: ₹${additionalMonthlyIncomeNeeded}/month (₹${additionalYearlyIncomeNeeded}/year)
Approximate EMI Interest Paid: ₹${approxMonthlyInterest}/month (₹${yearlyInterestPaid}/year)
User Notes: ${customNotes}
Target Language: ${targetLang.toUpperCase()}`;

      const dummyFile = financeFile || new File([new Blob([fullNotes])], 'personal_finance_target_wealth.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', dummyFile);
      formData.append('category', 'Financial Budget');
      formData.append('meetingNotes', fullNotes);
      formData.append('targetLanguage', targetLang);

      const res = await api.post('/documents/upload', formData);
      const doc = res.data.data.document;
      const docId = doc._id || doc.id;

      const transRes = await api.post(`/documents/${docId}/translate`, { targetLanguage: targetLang });

      setFinanceResult({
        doc,
        translatedSummary: transRes.data.data.translatedSummary,
        translatedText: transRes.data.data.translatedText
      });

      toast.dismiss();
      toast.success('Personal finance & target wealth analysis calculated successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Financial calculation failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <PiggyBank className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">💰 Personal Finance, EMI & Target Wealth AI Calculator</h1>
            <p className="text-xs text-emerald-100 opacity-90">
              Calculate earnings, expenditures, EMI interest, net savings, and target income gaps. Generates actionable wealth growth strategies in your specified language.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Financial Calculator Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <form onSubmit={handleFinanceSubmit} className="space-y-5">
              
              {/* Target Language Dropdown */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center space-x-1.5">
                  <Languages className="w-4 h-4 text-emerald-500" />
                  <span>Output Language for Financial Plan</span>
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-900 dark:text-emerald-100 focus:outline-none"
                >
                  <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                  <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                  <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                  <option value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">🇮🇳 മലയാളം (Malayalam)</option>
                  <option value="mr">🇮🇳 मराठी (Marathi)</option>
                  <option value="bn">🇮🇳 বাংলা (Bengali)</option>
                  <option value="gu">🇮🇳 ગુજરાતી (Gujarati)</option>
                  <option value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="or">🇮🇳 ଓଡ଼ିଆ (Odia)</option>
                  <option value="ur">🇮🇳 اردو (Urdu)</option>
                  <option value="as">🇮🇳 অসমীয়া (Assamese)</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español (Spanish)</option>
                  <option value="fr">🇫🇷 Français (French)</option>
                  <option value="de">🇩🇪 Deutsch (German)</option>
                  <option value="zh">🇨🇳 中文 (Chinese)</option>
                  <option value="ja">🇯🇵 日本語 (Japanese)</option>
                  <option value="ar">🇦🇪 العربية (Arabic)</option>
                </select>
              </div>

              {/* Earnings & Expenditures Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income / Earnings (₹)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="e.g. 85000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Living Expenses (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="e.g. 35000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* EMI & Interest Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly EMI Obligations (₹)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                    <input
                      type="number"
                      value={monthlyEmi}
                      onChange={(e) => setMonthlyEmi(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="e.g. 22000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">EMI Interest Rate (% p.a.)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="e.g. 9.5"
                    />
                  </div>
                </div>
              </div>

              {/* Target Income & Wealth Goals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Target Monthly Income (₹)</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="number"
                      value={targetMonthlyIncome}
                      onChange={(e) => setTargetMonthlyIncome(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold"
                      placeholder="e.g. 150000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Target Yearly Income (₹)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="number"
                      value={targetYearlyIncome}
                      onChange={(e) => setTargetYearlyIncome(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold"
                      placeholder="e.g. 1800000"
                    />
                  </div>
                </div>
              </div>

              {/* Optional File Upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-2">
                <UploadCloud className="w-7 h-7 text-emerald-500 mx-auto" />
                <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Optional: Upload Salary Slip, Bank Statement or Loan File</p>
                <input
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.csv,.txt"
                  onChange={(e) => setFinanceFile(e.target.files[0])}
                  className="w-full text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                />
                {financeFile && <p className="text-[10px] font-bold text-emerald-500">✓ {financeFile.name}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{processing ? 'Calculating Target Wealth Goals...' : 'Calculate Financial Goals & EMI Strategy'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time Financial Cards & AI Target Wealth Report */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Real-Time Financial Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Current Net Savings</span>
              <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-300">₹{currentNetSavings.toLocaleString()} / mo</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{monthlySavingsRate}% Savings Rate</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Target Earning Gap</span>
              <h3 className="text-xl font-black text-indigo-700 dark:text-indigo-300">₹{additionalMonthlyIncomeNeeded.toLocaleString()} / mo</h3>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Additional Required Income</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Monthly EMI Outflow</span>
              <h3 className="text-xl font-black text-purple-700 dark:text-purple-300">₹{monthlyEmi.toLocaleString()} / mo</h3>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">~₹{approxMonthlyInterest.toLocaleString()} Interest</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Yearly Earning Shortfall</span>
              <h3 className="text-xl font-black text-amber-700 dark:text-amber-300">₹{additionalYearlyIncomeNeeded.toLocaleString()} / yr</h3>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">To reach ₹{(targetYearlyIncome/100000).toFixed(1)} Lakhs/yr</p>
            </div>
          </div>

          {/* AI Financial Analysis Report Output */}
          {financeResult ? (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calculator className="w-4 h-4" />
                    <span>Target Wealth Strategy ({targetLang.toUpperCase()})</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(financeResult.translatedText);
                      toast.success('Copied financial analysis to clipboard!');
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-lg flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Plan</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {financeResult.translatedText}
                </pre>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/documents/${financeResult.doc._id}`)}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-md hover:opacity-95 text-center flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open Full Financial Report & Social Designer</span>
                </button>

                <button
                  onClick={() => downloadDocumentFile(financeResult.doc._id, 'pdf', 'personal_finance_target_wealth_report.pdf')}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
                  title="Download PDF Financial Report"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-4 text-slate-400 shadow-xl">
              <PiggyBank className="w-16 h-16 text-emerald-500/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Financial Plan Generated Yet</h3>
                <p className="text-xs max-w-md mx-auto">Enter your monthly earnings, expenditures, EMI obligations, and set your target monthly/yearly earning goals. Click "Calculate Financial Goals" to view your target income gap and EMI interest savings plan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
