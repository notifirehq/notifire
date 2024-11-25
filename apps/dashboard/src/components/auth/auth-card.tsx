import { Card } from '../primitives/card';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return <Card className="flex min-h-[692px] w-full overflow-hidden bg-[#ffffff]">{children}</Card>;
}