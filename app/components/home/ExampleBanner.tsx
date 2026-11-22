import { memo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Button } from '../ui';

/**
 * Example custom home block, declared in twilight.json as `home.example-banner` and bound in
 * app/router.tsx under the key `example-banner` (the engine strips `home.`). Copy it to start a
 * block of your own: a new path, a fresh `key` (a UUID), the fields the merchant edits, and a
 * registration in `registerHomeComponents`.
 *
 * `data` holds the merchant's field values by `id`; multilanguage fields arrive already in the
 * page's language. Never trust them to be set: every field may be empty.
 */
export interface ExampleBannerData {
  title?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  [key: string]: unknown;
}

export const ExampleBanner = memo(function ExampleBanner({ data }: { data: ExampleBannerData }) {
  const { title, description, button_text: buttonText, button_url: buttonUrl } = data;
  if (!title && !description) return null;

  return (
    <div className="container">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-accent-soft p-6 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl text-start">
          {title && <h2 className="m-0 text-2xl font-bold">{title}</h2>}
          {description && <p className="mb-0 mt-2 text-muted">{description}</p>}
        </div>
        {buttonText && buttonUrl && (
          <Button asChild>
            <Link to={buttonUrl}>{buttonText}</Link>
          </Button>
        )}
      </div>
    </div>
  );
});
