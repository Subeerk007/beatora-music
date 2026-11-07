export interface ISong {
  _id?: string;
  title: string;
  artist: string;
  category: string;
  duration?: number;
  audioUrl: string;
  audioPublicId?: string;
  coverUrl?: string;
  coverPublicId?: string;
  plays?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
