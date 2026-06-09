import PropertiesListingPage from '@/components/property/PropertiesListingPage';

export default function RentalsPage() {
  return (
    <PropertiesListingPage
      title="Rental Properties"
      basePath="/rentals"
      lockedPropertyStatus="for_rent"
      pageSize={48}
      resultLabel="rentals"
      emptyTitle="No rentals found"
    />
  );
}
