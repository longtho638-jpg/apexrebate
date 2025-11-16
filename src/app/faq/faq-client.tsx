// Simplified FAQ page to avoid 500 errors
const faqData = [
  {
    id: '1',
    question: 'ApexRebate là gì?',
    answer: 'ApexRebate là dịch vụ hoàn phí giao dịch cho trader.'
  },
  {
    id: '2',
    question: 'Mức hoàn phí là bao nhiêu?',
    answer: 'Tùy sàn, khoảng 20-40% phí giao dịch.'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">FAQ - Câu hỏi thường gặp</h1>
      <div className="space-y-6">
        {faqData.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            <h3 className="font-semibold mb-2">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
