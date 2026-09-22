import { getI18n } from "../i18n/server";
import PaymentCalculatorForm from "./PaymentCalculatorForm";

export default async function PaymentCalculator() {
  const { locale, content } = await getI18n();
  return <PaymentCalculatorForm locale={locale} settings={content.paymentCalculator} ui={content.ui} />;
}
