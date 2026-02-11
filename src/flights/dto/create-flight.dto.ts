export class CreateFlightDto {
  readonly from: string;
  readonly fromCode: string;
  readonly to: string;
  readonly toCode: string;
  readonly aircraft: string;
  readonly price: string;
  readonly date: string;
  readonly time: string;
  readonly capacity: string;
  readonly luggage: string;
  readonly discount: string;
  readonly timeLeft: number;
  readonly images: string[];
}
