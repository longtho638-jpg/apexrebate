import {getRequestConfig} from 'next-intl/server';

const SUPPORTED_LOCALES = ['vi', 'en'] as const;
const DEFAULT_LOCALE = 'vi' as const;

export default getRequestConfig(async ({locale}) => {
	const loc = locale ?? DEFAULT_LOCALE;
	const current = (SUPPORTED_LOCALES as readonly string[]).includes(loc)
		? loc
		: DEFAULT_LOCALE;

	return {
		locale: current,
		messages: (await import(`../../messages/${current}.json`)).default
	};
});
