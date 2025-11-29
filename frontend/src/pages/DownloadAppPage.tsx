import React from 'react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';

const downloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL || 'https://example.com/last-ned';
const iosUrl = import.meta.env.VITE_APP_IOS_URL || downloadUrl;
const androidUrl = import.meta.env.VITE_APP_ANDROID_URL || downloadUrl;

export default function DownloadAppPage(): React.ReactElement {
  return (
    <PageLayout
      title="Last ned appen"
      subtitle="Installer omstillingsappen på mobilen din for rask tilgang til plan, veiviser og varslinger."
      maxWidthClassName="max-w-3xl"
    >
      <div className="space-y-6">
        <Card title="Velg plattform">
          <p className="text-sm text-slate-700 mb-4">
            Åpner du siden på mobilen kan du også velge «Legg til på hjemskjermen» for å få webappen
            som ikon.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={iosUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              📱 Last ned til iPhone
            </a>
            <a
              href={androidUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              🤖 Last ned til Android
            </a>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
