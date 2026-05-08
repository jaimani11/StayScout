import { Workspace } from '@/features/workspace/workspace';
import { HowItWorks } from '@/features/marketing/how-it-works';
import { FeaturedStays } from '@/features/marketing/featured-stays';
import { WhyStayScout } from '@/features/marketing/why-stayscout';
import { Footer } from '@/features/marketing/footer';

export default function Page() {
  return (
    <>
      <Workspace />
      <HowItWorks />
      <FeaturedStays />
      <WhyStayScout />
      <Footer />
    </>
  );
}
