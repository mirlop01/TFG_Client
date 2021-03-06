import { Deserializable } from "../_heplers/deseriabizable";

export class InsulinModel implements Deserializable {
    public _id: string;
    public type: string;
    public typeName: string;
    public quantity: number;
    public createdAt: Date;

    deserialize(data: any) {
        Object.assign(this, data);
        return this;
    }
}
