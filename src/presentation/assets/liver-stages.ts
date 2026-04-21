/**
 * Metro icin statik require (goreli yol; @/ alias require icin sorun cikarabiliyor).
 * Evre 1 = en iyi skor, evre 5 = en dusuk.
 * Dosyalar: assets/liver/liver_stage_1.png … liver_stage_5.png
 */
export const LIVER_STAGE_IMAGES = [
  require('../../../assets/liver/liver_stage_1.png'),
  require('../../../assets/liver/liver_stage_2.png'),
  require('../../../assets/liver/liver_stage_3.png'),
  require('../../../assets/liver/liver_stage_4.png'),
  require('../../../assets/liver/liver_stage_5.png'),
] as const;

export const LIVER_STAGE_COUNT = 5;
