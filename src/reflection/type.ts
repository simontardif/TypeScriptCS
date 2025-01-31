import * as npAssembly from "./assembly";
import * as npMethod from "./method";
import { ReflectionHelper } from "../utilities/reflectionhelper";
import * as npMethodInfo from "./methodinfo";

declare var Module;

export namespace JSharp
{
    export class Type
    {
        private _typePath: string;
        private _assembly: npAssembly.JSharp.Assembly;
        private _find_class: any;
        private _internalType: any;
        private _namespace: string;
        private _typeName: string;
        public constructor(assembly: npAssembly.JSharp.Assembly, internalType: number, namespace: string, typeName: string, typePath: string)
        {
            this._assembly = assembly;
            this._typePath = typePath;
            this._namespace = namespace;
            this._typeName = typeName;
            this._internalType = internalType;
        }

        public get namespace(): string
        {
            return this._namespace;
        }

        public get typeName(): string
        {
            return this._typeName;
        }
    
        public getMethod(name: string)
        {
            var find_method = Module.cwrap('mono_wasm_assembly_find_method', 'number', ['number', 'string', 'number']);
            var internalMethod = find_method(this._internalType, name, -1);
    
            if (internalMethod === 0)
            {
                throw new Error("Cannot find method '" + name + "'!");
            }
    
            return new npMethod.JSharp.Method(this, internalMethod, name);
        }
    
        public getMethods(methodInfo: npMethodInfo.JSharp.MethodInfo = npMethodInfo.JSharp.MethodInfo.Static): npMethod.JSharp.Method[]
        {
            var methods = [];
            var methodsString = ReflectionHelper.getTypeMethods(this._assembly.name, this._typePath, methodInfo);
    
            var methodsArray = JSON.parse(methodsString);
            for (let method of methodsArray)
            {
                methods.push(this.getMethod(method));
            }
    
            return methods;
        }
    
        public get internalType(): any
        {
            return this._internalType;
        }
    
        public get isValid(): boolean
        {
            return this._internalType !== 0;
        }
    }
}

