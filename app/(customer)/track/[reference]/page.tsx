import type { Metadata } from "next";

import BookingTracker from "@/components/booking/BookingTracker";

type TrackingPageProps = {
  params: Promise<{
    reference: string;
  }>;

  searchParams: Promise<{
    token?: string;
  }>;
};

export async function generateMetadata({
  params,
}: TrackingPageProps): Promise<Metadata> {
  const { reference } = await params;

  return {
    title: `Track ${reference}`,
    description: "Follow the current status of your SamWest booking.",
  };
}

export default async function TrackingPage({
  params,
  searchParams,
}: TrackingPageProps) {
  const { reference } = await params;
  const { token = "" } = await searchParams;

  return <BookingTracker reference={reference} token={token} />;
}
