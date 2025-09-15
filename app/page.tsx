import { CsvUploadForm } from "@/components/csv-upload-form";

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Cashflow Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your revenue and expense data to analyze your cashflow
        </p>
      </div>
      <CsvUploadForm />
    </div>
  );
}
