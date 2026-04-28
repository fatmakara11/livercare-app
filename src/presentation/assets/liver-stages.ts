/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Metro icin statik require (goreli yol; @/ alias require icin sorun cikarabiliyor).
 * Evre 1 en iyi durumdan Evre 5 en kritik duruma dogru ilerler.
 */
export const LIVER_STAGE_FALLBACK_IMAGES = [
  require('../../../assets/liver/liver_stage_1.png'),
  require('../../../assets/liver/liver_stage_2.png'),
  require('../../../assets/liver/liver_stage_3.png'),
  require('../../../assets/liver/liver_stage_4.png'),
  require('../../../assets/liver/liver_stage_5.png'),
] as const;

export const LIVER_STAGE_MODELS = [
  require('../../../assets/liver/Meshy_AI_Anatomical_liver_with_0428074634_texture_mobile.glb'),
  require('../../../assets/liver/Meshy_AI_Liver_0428072700_texture_mobile.glb'),
  require('../../../assets/liver/Meshy_AI_Liver_with_Biliary_Tr_0428073412_texture_mobile.glb'),
  require('../../../assets/liver/Meshy_AI_Cirrhotic_liver_0428074551_texture_mobile.glb'),
  require('../../../assets/liver/Meshy_AI_Cirrhotic_liver_0428074613_texture_mobile.glb'),
] as const;

export const LIVER_STAGE_MODELS_ORIGINAL = [
  require('../../../assets/liver/Meshy_AI_Anatomical_liver_with_0428074634_texture.glb'),
  require('../../../assets/liver/Meshy_AI_Liver_0428072700_texture.glb'),
  require('../../../assets/liver/Meshy_AI_Liver_with_Biliary_Tr_0428073412_texture.glb'),
  require('../../../assets/liver/Meshy_AI_Cirrhotic_liver_0428074551_texture.glb'),
  require('../../../assets/liver/Meshy_AI_Cirrhotic_liver_0428074613_texture.glb'),
] as const;

export const LIVER_STAGE_COUNT = 5;
