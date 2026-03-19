import imageMap from '@/generated/image-map'

export const getImageSource = (key: string): number | undefined => imageMap[key]
