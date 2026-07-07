import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  CreditCard,
  FileText,
  X,
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { validityTypes } from './paymentData';

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const emptyForm = {
  paymentDate: '',
  userType: '',
  customer: '',
  email: '',
  phone: '',
  plan: '',
  planName: '',
  planAmount: '',
  discount: '0',
  paidAmount: '',
  paymentMethod: '',
  paymentGateway: '',
  gatewayTxnId: '',
  invoiceNo: '',
  paymentStatus: '',
  validityType: '',
  validFrom: '',
  validTill: '',
  remarks: '',
  recordedBy: 'Admin',
};

export const AddPayment = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [plans, setPlans] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredCustomers = useMemo(() => (
    form.userType ? customers.filter((item) => item.type === form.userType) : customers
  ), [customers, form.userType]);

  const filteredPlans = useMemo(() => (
    plans.filter((item) => item.status !== 'inactive')
  ), [plans]);

  const inputCls = 'w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400';
  const labelCls = 'block text-xs font-bold text-slate-600 mb-2';

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [customersRes, plansRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/payments/customers`),
          axios.get(`${BASE_API_URL}/masters/plans?limit=1000`),
        ]);
        const planRows = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.docs || [];
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        setPlans(planRows);
      } catch (err) {
        setAlert({ type: 'error', text: err.response?.data?.message || 'Payment form data could not be loaded.' });
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setForm(emptyForm);
      setCustomerSearch('');
      return;
    }

    const fetchPayment = async () => {
      setLoadingPayment(true);
      setAlert({ type: '', text: '' });
      try {
        const response = await axios.get(`${BASE_API_URL}/payments/${id}`);
        const payment = response.data;
        setCustomerSearch(payment.customerName || '');
        setForm({
          paymentDate: toDateInputValue(payment.paymentDate),
          userType: payment.userType || '',
          customer: payment.customer || '',
          email: payment.email || '',
          phone: payment.phone || '',
          plan: payment.plan?._id || payment.plan || '',
          planName: payment.planName || payment.plan?.planName || '',
          planAmount: String(payment.planAmount ?? ''),
          discount: String(payment.discount ?? '0'),
          paidAmount: String(payment.paidAmount ?? ''),
          paymentMethod: payment.paymentMethod || '',
          paymentGateway: payment.paymentGateway || '',
          gatewayTxnId: payment.gatewayTxnId || '',
          invoiceNo: payment.invoiceNo || '',
          paymentStatus: payment.paymentStatus || '',
          validityType: payment.validityType || '',
          validFrom: toDateInputValue(payment.validFrom),
          validTill: toDateInputValue(payment.validTill),
          remarks: payment.remarks || '',
          recordedBy: payment.recordedBy || 'Admin',
        });
      } catch (err) {
        setAlert({ type: 'error', text: err.response?.data?.message || 'Payment details could not be loaded.' });
      } finally {
        setLoadingPayment(false);
      }
    };

    fetchPayment();
  }, [id, isEditMode]);

  const handleCustomerChange = (value) => {
    setCustomerSearch(value);
    const query = value.trim().toLowerCase();
    const customer = filteredCustomers.find((item) => item.name.toLowerCase() === query);
    setForm((prev) => ({
      ...prev,
      customer: customer?._id || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      userType: customer?.type || prev.userType,
    }));
  };

  const handlePlanChange = (id) => {
    const plan = plans.find((item) => item._id === id);
    const amount = Number(plan?.cost || 0);
    setForm((prev) => ({
      ...prev,
      plan: id,
      planName: plan?.planName || '',
      validityType: plan?.planValidity || prev.validityType,
      planAmount: plan ? String(amount) : '',
      paidAmount: plan ? String(Math.max(amount - Number(prev.discount || 0), 0)) : '',
    }));
  };

  const handleDiscountChange = (value) => {
    const discount = Number(value || 0);
    const amount = Number(form.planAmount || 0);
    setForm((prev) => ({
      ...prev,
      discount: value,
      paidAmount: String(Math.max(amount - discount, 0)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['paymentDate', 'userType', 'email', 'planName', 'planAmount', 'paidAmount', 'paymentMethod', 'paymentGateway', 'paymentStatus', 'validityType', 'validFrom', 'validTill'];
    const missing = required.some((key) => !form[key]) || !customerSearch.trim();
    if (missing) {
      setAlert({ type: 'error', text: 'Please fill all required payment fields.' });
      return;
    }

    setSubmitting(true);
    setAlert({ type: '', text: '' });
    try {
      const payload = {
        ...form,
        customerName: customerSearch.trim(),
        planAmount: Number(form.planAmount) || 0,
        discount: Number(form.discount) || 0,
        paidAmount: Number(form.paidAmount) || 0,
      };

      if (isEditMode) {
        await axios.put(`${BASE_API_URL}/payments/${id}`, payload);
      } else {
        await axios.post(`${BASE_API_URL}/payments`, payload);
      }

      setAlert({ type: 'success', text: 'Success! Record added/updated successfully.' });
      if (!isEditMode) {
        setForm(emptyForm);
        setCustomerSearch('');
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Payment could not be added. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-semibold text-slate-800">{isEditMode ? 'Edit Payment' : 'Add / Update Payment'}</h4>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            View Listings
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {alert.text && (
            <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${
              alert.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              {alert.type === 'success'
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="flex-1">{alert.text}</span>
              <button type="button" onClick={() => setAlert({ type: '', text: '' })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loadingPayment && <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">Loading payment details...</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <SectionTitle icon={<CreditCard className="w-4 h-4" />} label="Payment Information" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Payment Date" required>
                <input type="date" value={form.paymentDate} onChange={(e) => setValue('paymentDate', e.target.value)} className={inputCls} />
              </Field>
              <Field label="User Type" required>
                <select
                  value={form.userType}
                  onChange={(e) => {
                    setCustomerSearch('');
                    setForm({ ...form, userType: e.target.value, customer: '', email: '', phone: '', plan: '', planName: '', planAmount: '', paidAmount: '' });
                  }}
                  className={inputCls}
                  disabled={loadingOptions}
                >
                  <option value="">Choose</option>
                  <option value="Jobseeker">jobseeker</option>
                  <option value="Employer">employer</option>
                </select>
              </Field>
              <Field label="Customer" required>
                <input
                  value={customerSearch}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  list="payment-customer-options"
                  placeholder="Type customer name"
                  className={inputCls}
                  disabled={loadingOptions}
                />
                <datalist id="payment-customer-options">
                  {filteredCustomers.map((customer) => <option key={customer._id} value={customer.name} />)}
                </datalist>
              </Field>
              <Field label="Email" required>
                <input type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={(e) => setValue('phone', e.target.value)} placeholder="Phone Number" className={inputCls} />
              </Field>
              <Field label="Jobseeker Plan Listing" required>
                <select value={form.plan} onChange={(e) => handlePlanChange(e.target.value)} className={inputCls} disabled={loadingOptions}>
                  <option value="">Choose</option>
                  {filteredPlans.map((plan) => <option key={plan._id} value={plan._id}>{plan.planName}</option>)}
                </select>
              </Field>
              <Field label="Plan Amount (Rs.)" required>
                <input type="number" value={form.planAmount} onChange={(e) => setValue('planAmount', e.target.value)} placeholder="Plan Amount" className={inputCls} />
              </Field>
              <Field label="Discount (Rs.)">
                <input type="number" value={form.discount} onChange={(e) => handleDiscountChange(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Paid Amount (Rs.)" required>
                <input type="number" value={form.paidAmount} onChange={(e) => setValue('paidAmount', e.target.value)} placeholder="Paid Amount" className={inputCls} />
              </Field>
              <Field label="Payment Method" required>
                <select value={form.paymentMethod} onChange={(e) => setValue('paymentMethod', e.target.value)} className={inputCls}>
                  <option value="">Choose</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Net Banking</option>
                  <option>Wallet</option>
                  <option>Cheque</option>
                </select>
              </Field>
              <Field label="Payment Gateway" required>
                <select value={form.paymentGateway} onChange={(e) => setValue('paymentGateway', e.target.value)} className={inputCls}>
                  <option value="">Choose</option>
                  <option>Razorpay</option>
                  <option>PayU</option>
                  <option>Cash</option>
                  <option>Bank</option>
                </select>
              </Field>
              <Field label="Gateway Transaction ID">
                <input value={form.gatewayTxnId} onChange={(e) => setValue('gatewayTxnId', e.target.value)} placeholder="e.g. rzp_xxx" className={inputCls} />
              </Field>
              <Field label="Invoice / Receipt No.">
                <input value={form.invoiceNo || 'Auto generated after save'} readOnly disabled className={inputCls} />
              </Field>
              <Field label="Payment Status" required>
                <select value={form.paymentStatus} onChange={(e) => setValue('paymentStatus', e.target.value)} className={inputCls}>
                  <option value="">Choose</option>
                  <option>Success</option>
                  <option>Pending</option>
                  <option>Failed</option>
                  <option>Refunded</option>
                </select>
              </Field>
            </div>

            <SectionTitle icon={<CalendarDays className="w-4 h-4" />} label="Subscription Validity" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Validity Type" required>
                <select value={form.validityType} onChange={(e) => setValue('validityType', e.target.value)} className={inputCls}>
                  <option value="">Choose</option>
                  {validityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Valid From" required>
                <input type="date" value={form.validFrom} onChange={(e) => setValue('validFrom', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Valid Till" required>
                <input type="date" value={form.validTill} onChange={(e) => setValue('validTill', e.target.value)} className={inputCls} />
              </Field>
            </div>

            <SectionTitle icon={<FileText className="w-4 h-4" />} label="Other Details" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className={labelCls}>Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setValue('remarks', e.target.value)} rows={4} placeholder="Additional notes about this payment" className={inputCls} />
              </div>
              <Field label="Recorded By">
                <input value={form.recordedBy} onChange={(e) => setValue('recordedBy', e.target.value)} className={inputCls} />
              </Field>
            </div>

            <button type="submit" disabled={submitting || loadingOptions || loadingPayment} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required = false, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-3 bg-slate-50 rounded-lg text-sm font-bold text-slate-700">
    {icon}
    {label}
  </div>
);

export default AddPayment;
