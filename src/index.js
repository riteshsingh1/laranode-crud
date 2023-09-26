const config = require("../../../schema.json");
const { EOL } = require("os");
const fs = require("fs");

try {
  handlePrismaSchema();

  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    handleValidations(element.name, element.columns);
  }
  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    handleTypes(element.name, element.columns);
  }
  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    handleService(element.name, element.columns);
  }
  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    handleController(element.name);
  }
} catch (err) {
  console.error(err);
}

function handleService(fileName, columns) {
  let serviceString = `
import { ${fileName}, PrismaClient } from '@prisma/client';
import {
  ICreate${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IUpdate${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IEdit${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IDelete${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
} from '../dtos/${fileName}.dto';
// initialized prisma client, you can do this in a seperate file as well
const prisma = new PrismaClient();${EOL}
/**
 * Saves ${fileName} into database
 * @param data {
 `;
  columns.forEach((c) => {
    if (c.name != "timestamps" && !c.notRequiredInForm) {
      serviceString += ` * ${c.name}: ${c.type},
`;
    }
  });

  serviceString += `* }
 * @returns {errorCode:'NO_ERROR' | 'EXCEPTION_ERROR', data:any}
 */
const create${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async (data:ICreate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR' | 'EXCEPTION_ERROR', data:any}> => {
  try{
    const model = await prisma.${fileName}.create({
      data: {
        `;
  // create
  columns.forEach((c) => {
    if (c.name != "timestamps" && !c.notRequiredInForm) {
      serviceString += `${c.name}: data.${c.name},`;
    }
    if (c.notRequiredInForm) {
      serviceString += `${c.name}:${c.defaultValue},`;
    }
  });
  serviceString += `
      createdAt: new Date(),
      updatedAt : new Date()
    }
  });
  if(model){
    return {
      errorCode: 'NO_ERROR',
      data: model
    }
  }
  return { errorCode:'EXCEPTION_ERROR', data:null }

  } catch(err:any) {
    console.log('ERROR_IN_SAVING', err.Message);
    return {errorCode:'EXCEPTION_ERROR',data:null}
  }
}

/**
 * Fetches Single User From Database
 * @param data {
 *  id: number
 * }
 * @returns { errorCode:'NO_ERROR' | 'EXCEPTION_ERROR', data:any }
 */
const edit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async(data:IEdit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR' | 'EXCEPTION_ERROR', data:any}> => { ${EOL}
  try {
    const model = await prisma.${fileName}.findFirst({
      where: {
        id: data.id
      }
    });
    if(model){
      return {
        errorCode: 'NO_ERROR',
        data: model
      }
    }
    return { errorCode:'EXCEPTION_ERROR', data:null }
  } catch(err:any) {
    console.log('ERROR_IN_SAVING', err.Message);
    return { errorCode:'EXCEPTION_ERROR', data:null }
  }
}

/**
 * Updates single  ${fileName} into database
 * @param data {
 `;
  columns.forEach((c) => {
    if (c.name != "timestamps" && !c.notRequiredInForm) {
      serviceString += ` * ${c.name}: ${c.type},
`;
    }
  });

  serviceString += `* }
 * @returns {errorCode:'NO_ERROR' | 'EXCEPTION_ERROR', data:any}
 */
const update${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async (data:IUpdate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR' | 'EXCEPTION_ERROR' | 'INVALID_DATA', data?:any}> => { 
  try{
    const model = await prisma.${fileName}.update({
      where:{
        id:data.id
      },
      data: {
      `;
  // create
  columns.forEach((c) => {
    if (c.name != "timestamps" && !c.notRequiredInForm) {
      serviceString += `      ${c.name}: data.${c.name},
    `;
    }
  });
  serviceString += `      updatedAt : new Date()
        }
      });
      if(model){
        return {
          errorCode: 'NO_ERROR',
          data: model
        }
      }
      return { errorCode: 'EXCEPTION_ERROR' }
  } catch(err:any) {
    console.log('ERROR_IN_SAVING', err.Message);
    return { errorCode:'EXCEPTION_ERROR', data:null }
  }
}
`;

  // findAll
  serviceString += `
  /**
   * Fetches All ${fileName} From Database
   * @returns {errorCode: 'NO_ERROR' | 'EXCEPTION_ERROR', data? : any}
   */
  const findAll${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async  ():Promise<{errorCode:'NO_ERROR'|'EXCEPTION_ERROR', data?:any}> => {
   try{
    const record = await prisma.${fileName}.findMany();

    if(record){
      return {
        errorCode: 'NO_ERROR',
        data: record
      }
    }
    return { errorCode:'EXCEPTION_ERROR' }
   }catch(err:any){
        console.log('ERROR_IN_SAVING', err.Message);
        return { errorCode:'EXCEPTION_ERROR',data:null }
    }
}
`;

  // delete
  serviceString += `
/**
 * Deletes Single ${fileName} From Database
 * @returns {errorCode: 'NO_ERROR' | 'EXCEPTION_ERROR'}
 */
  const delete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async  (data:IDelete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR'|'EXCEPTION_ERROR'}> => {
   try{
    const record = await prisma.${fileName}.delete({
        where:{
          id:data.id
        }
    });

    if(record){
        return {
            errorCode: 'NO_ERROR',
        }
    }
    return {errorCode:'EXCEPTION_ERROR'}
   }catch(err:any){
        console.log('ERROR_IN_SAVING', err.Message);
        return {errorCode:'EXCEPTION_ERROR'}
    }
}
  
  export const ${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Service = {
    create${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    edit${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    update${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    findAll${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    delete${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  }
  `;

  var dir = "src/services";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`src/services/${fileName}.service.ts`, serviceString);
}

function handleController(fileName) {
  let controllerString = `
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Service } from '../services/${fileName}.service';${EOL}
const { 
  create${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  edit${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  update${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  findAll${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  delete${fileName.charAt(0).toUpperCase() + fileName.slice(1)}
} = ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Service; ${EOL}`;

  controllerString += `
const create =  async (req:Request ,res:Response) => { 
  const result = validationResult(req.body);
  if(!result.isEmpty()) {
    return res.json({
        errorCode:'VALIDATION_ERROR',
        data:result.array()
    })
  }
  const { errorCode, data } = await create${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }(req.body);
  return res.json({
    errorCode,
    data,
  });
};

const edit =  async (req:Request ,res:Response) => { 
  const result = validationResult(req.body);
  if(!result.isEmpty()){
    return res.json({
      errorCode:'VALIDATION_ERROR',
      data:result.array()
    })
  }
  const { errorCode, data } = await edit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }(req.body);${EOL}
  return res.json({
    errorCode,
    data,
  });
}

const update =  async (req:Request ,res:Response) => { 
  const result = validationResult(req.body);
  if(!result.isEmpty()){
    return res.json({
      errorCode:'VALIDATION_ERROR',
      data:result.array()
    })
  }
  const {errorCode,data} = await update${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }(req.body);
  return res.json({
    errorCode,
    data
  })
}

const findAllRecords =  async (req:Request ,res:Response) => { 
  const result = validationResult(req.body);
  if(!result.isEmpty()){
    return res.json({
      errorCode:'VALIDATION_ERROR',
      data:result.array()
    })
  }
  const { errorCode,data } = await findAll${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }();
    return res.json({
        errorCode,
        data
    })
}


const deleteRecord =  async (req:Request,res:Response) => { 
  const result = validationResult(req.body);
  if(!result.isEmpty()){
    return res.json({
      errorCode:'VALIDATION_ERROR',
      data:result.array()
    })
  }
  const { errorCode } = await delete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }(req.body);

  return res.json({
    errorCode
  });
}


export const ${fileName}Controller = [
  create,
  edit,
  update,
  deleteRecord,
  findAllRecords
]`;
  var dir = "src/controllers";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    `src/controllers/${fileName}.controller.ts`,
    controllerString
  );
}

function handleValidations(fileName, columns) {
  let validatorString = `import { body } from 'express-validator';${EOL}`;

  validatorString += `const validateCreate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Request =  [ ${EOL}`;
  columns.forEach((ele) => {
    if (ele.name != "timestamps" && !ele.notRequiredInForm) {
      validatorString += `body("${ele.name}").notEmpty(), ${EOL}`;
    }
  });
  validatorString += `] ${EOL}`;

  validatorString += `const validateUpdate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Request =  [ ${EOL} body("id").notEmpty(), ${EOL}`;
  columns.forEach((eleUpdate) => {
    if (eleUpdate.name != "timestamps" && !eleUpdate.notRequiredInForm) {
      validatorString += `body("${eleUpdate.name}").notEmpty(), ${EOL}`;
    }
  });
  validatorString += `] ${EOL}`;

  validatorString += `const validateEdit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Request  = [ ${EOL}`;
  validatorString += `body("id").notEmpty(), ${EOL}`;
  validatorString += `] ${EOL}`;

  validatorString += `const validateDelete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Request  =  [ ${EOL}`;
  validatorString += `body("id").notEmpty(), ${EOL}`;
  validatorString += `] ${EOL}`;

  validatorString += `
export const ${fileName}RequestValidator = {
  validateDelete${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Request,
  validateEdit${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Request,
  validateUpdate${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Request,
  validateCreate${fileName.charAt(0).toUpperCase() + fileName.slice(1)}Request,

}
    `;

  var dir = "src/validations";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`src/validations/${fileName}.ts`, validatorString);
}

function handlePrismaSchema() {
  const schema = fs.readFileSync(__dirname + "/stubs/schema.stub", "utf8");
  let schemaString = schema;
  schemaString = schemaString.replace(
    "$$provider$$",
    `"${config.databaseType}"`
  );
  if (config.relationShipMode === "prisma") {
    schemaString = schemaString.replace(
      "$$relationMode$$",
      `relationMode = "prisma"`
    );
  } else {
    schemaString = schemaString.replace("$$relationMode$$", "");
  }
  const modelString = writePrismaModels();
  schemaString = schemaString.replace("$$models$$", modelString);
  fs.writeFileSync("prisma/schema.prisma", schemaString);
}

function writePrismaModels() {
  const model = fs.readFileSync(__dirname + "/stubs/prisma.model.stub", "utf8");
  let newModel = "";

  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    // console.log('e',element)
    newModel += `model ${element.name} { ${EOL}  id       Int    @id @default(autoincrement()) ${EOL}`;
    element.columns.forEach((ele) => {
      if (ele.name == "timestamps") {
        newModel += `createdAt    DateTime @default(now()) ${EOL} updatedAt    DateTime @default(now()) ${EOL}`;
      } else {
        newModel += `${ele.name}     ${
          ele.type.charAt(0).toUpperCase() + ele.type.slice(1)
        } ${ele?.unique ? "@unique()" : ""} ${EOL}`;
        // work on relation fields
        // if(ele.relationField){
        //     newModel += ``
        // }
      }
    });
    newModel += `} ${EOL}`;
  }
  return newModel;
}

function handleTypes(fileName, columns) {
  let typeString = `// Generated By NPM Crud Author<hello@imritesh.com>${EOL}`;

  typeString += `
export interface ICreate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } {
    `;
  columns.forEach((ele) => {
    if (ele.name != "timestamps" && !ele.notRequiredInForm) {
      typeString += ` ${ele.name}: ${
        ele.type === "Int" ? "number" : "string;"
      } ${EOL}`;
    }
  });
  typeString += `}`;

  typeString += `
export interface IEdit${fileName.charAt(0).toUpperCase() + fileName.slice(1)} {
  id: number;
`;

  typeString += `}${EOL}`;
  typeString += `
export interface IUpdate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } {
    id: number;
    `;
  columns.forEach((ele) => {
    if (ele.name != "timestamps" && !ele.notRequiredInForm) {
      typeString += `${ele.name} : ${
        ele.type === "Int" ? "Number" : "string;"
      } ${EOL}`;
    }
  });
  typeString += `}`;
  typeString += `
export interface IDelete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } {
  id: number;
`;
  typeString += `}${EOL}
    `;

  var dir = "src/dtos";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`src/dtos/${fileName}.dto.ts`, typeString);
}
