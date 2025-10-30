function generatePaymentStatus(moveInDate, allPayments, monthlyRent) {
  const paymentStatusByMonth = [];
  let previousPayable = 0;
  let currentPayable = 0;

  const now = new Date();
  let currentMonth = new Date(moveInDate.getFullYear(), moveInDate.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  function formatMonthYear(date) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  }

  while (currentMonth <= endMonth) {
    const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const monthYearStr = formatMonthYear(currentMonth);

    const paymentForMonth = allPayments.find(
      (p) => p.coverage_period === monthKey && p.status === 'paid'
    );

    paymentStatusByMonth.push({
      monthYear: monthYearStr,
      amountPaid: paymentForMonth ? paymentForMonth.amount : 0,
      status: paymentForMonth ? 'Paid' : 'Unpaid',
      monthKey,
    });

    if (!paymentForMonth) {
      if (currentMonth < new Date(now.getFullYear(), now.getMonth(), 1))
        previousPayable += monthlyRent;
      else if (
        currentMonth.getMonth() === now.getMonth() &&
        currentMonth.getFullYear() === now.getFullYear()
      )
        currentPayable = monthlyRent;
    }

    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return { paymentStatusByMonth, previousPayable, currentPayable };
}
