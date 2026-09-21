import { useAppSelector } from '@/app/store';
import { dictionaries, type LandingDict } from '@/shared/config/i18n';

import { selectLanguage } from '../model/language-slice';

/** The landing's copy, typed all the way down. Every band reads its own key
 *  off this object, so a missing Russian string is a type error rather than a
 *  key rendered raw on the page. */
export function useDict(): LandingDict {
  return dictionaries[useAppSelector(selectLanguage)];
}
