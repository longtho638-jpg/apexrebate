export const MemberCard = ({ name, tier, points }: { name: string; tier: string; points: string }) => (
  <div className="flex items-center justify-between rounded-lg border p-4">
    <div>
      <div className="font-semibold">{name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{tier}</div>
    </div>
    <div className="text-sm font-medium">{points}</div>
  </div>
)
