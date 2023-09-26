const config = require("./schema.json");
const { EOL } = require("os");
const fs = require("fs");

try {
  handlePrismaSchema();
  handleValidations();
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
  let serviceString = `import { ${fileName}, PrismaClient } from '@prisma/client' ${EOL}
  import {ICreate${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IUpdate${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IEdit${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
  IDelete${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
} from '../dtos/${fileName}.dto.ts';
  
  const create${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = (data:ICreate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }) => { ${EOL}
  try{
  const model = await prisma.${fileName}.create({
    data: {
  `;
  // create
  columns.forEach((c) => {
    serviceString += `
          ${c.name}: data.${c.name},
        `;
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
}catch(err:any){
    logger.error('ERROR_IN_SAVING', err.Message);
    return {errorCode:'EXCEPTION_ERROR',data:null}
}
}
`;
  // edit
  serviceString += ` const edit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = (data:IEdit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }) => { ${EOL}
  try{
  const model = await prisma.${fileName}.findOne({
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
}catch(err:any){
    logger.error('ERROR_IN_SAVING', err.Message);
    return {errorCode:'EXCEPTION_ERROR',data:null}
}
}


`;

  // update
  serviceString += `
  const update${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async (data:IUpdate${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR' | 'EXCEPTION_ERROR' | 'INVALID_DATA'}> => { ${EOL}
   try{
  const model = await prisma.${fileName}.create({
    data: {
  `;
  // create
  columns.forEach((c) => {
    serviceString += `
          ${c.name}: data.${c.name},
        `;
  });
  serviceString += `
  updatedAt : new Date()
}
});
if(model){
    return {
        errorCode: 'NO_ERROR',
        data: model
    }
}
return {errorCode:'EXCEPTION_ERROR'}
}catch(err:any){
    logger.error('ERROR_IN_SAVING', err.Message);
    return {errorCode:'EXCEPTION_ERROR',data:null}
}
}`;

  // findAll
  serviceString += `const findAll${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async  ():Promise<{errorCode:'NO_ERROR'|'EXCEPTION_ERROR'}> => {
   try{
    const record = await prisma.${fileName}.findAll();

    if(record){
        return {
            errorCode: 'NO_ERROR',
            data: model
        }
    }
    return {errorCode:'EXCEPTION_ERROR'}
   }catch(err:any){
        logger.error('ERROR_IN_SAVING', err.Message);
        return {errorCode:'EXCEPTION_ERROR',data:null}
    }
    
  }`;

  // delete
  serviceString += `const delete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  } = async  (data:IDelete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }):Promise<{errorCode:'NO_ERROR'|'EXCEPTION_ERROR'}> => {
   try{
    const record = await prisma.${fileName}.delete({
        id:data.id
    });

    if(record){
        return {
            errorCode: 'NO_ERROR',
            data: model
        }
    }
    return {errorCode:'EXCEPTION_ERROR'}
   }catch(err:any){
        logger.error('ERROR_IN_SAVING', err.Message);
        return {errorCode:'EXCEPTION_ERROR',data:null}
    }
    
  }
  
  export const ${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }Service = {
    create${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    edit${fileName.charAt(0).toUpperCase() + fileName.slice(1)},
    update${fileName.charAt(0).toUpperCase() + fileName.slice(1)},findAll${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  },
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
  let controllerString = `import {Request,Response} from 'express' ${EOL}
    import { validationResult } from 'express-validator';${EOL}
    import ${fileName}Service from '../services/${fileName}Service.ts'
    const {create${fileName.charAt(0).toUpperCase() + fileName.slice(1)},edit${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  },
update${fileName.charAt(0).toUpperCase() + fileName.slice(1)},findAll${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  },delete${
    fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }} = ${fileName}Service
    `;

  controllerString += `
    
    const create =  async (req:Request ,res:Response) => { ${EOL}
     const result = validationResult(req);${EOL}
     if(!result.isEmpty()){${EOL}
        return res.json({${EOL}
            errorCode:'VALIDATION_ERROR',${EOL}
            data:result.array()${EOL}
        })${EOL}
     }${EOL}
     const {errorCode,data} = await create${
       fileName.charAt(0).toUpperCase() + fileName.slice(1)
     }();${EOL}
     ${EOL}
     return  res.json({${EOL}
        errorCode,${EOL}
        data${EOL}
    })${EOL}
    }${EOL}

    const edit =  async (req:Request ,res:Response) => { ${EOL}
    const result = validationResult(req);${EOL}
    if(!result.isEmpty()){${EOL}
       return res.json({${EOL}
           errorCode:'VALIDATION_ERROR',${EOL}
           data:result.array()${EOL}
       })${EOL}
    }${EOL}
    const {errorCode,data} = await edit${
      fileName.charAt(0).toUpperCase() + fileName.slice(1)
    }();${EOL}
    ${EOL}
    return return res.json({${EOL}
       errorCode,${EOL}
       data${EOL}
   })${EOL}
   }${EOL}

   const update =  async (req:Request ,res:Response) => { ${EOL}
   const result = validationResult(req);${EOL}
   if(!result.isEmpty()){${EOL}
      return res.json({${EOL}
          errorCode:'VALIDATION_ERROR',${EOL}
          data:result.array()${EOL}
      })${EOL}
   }${EOL}
    const {errorCode,data} = await update${
      fileName.charAt(0).toUpperCase() + fileName.slice(1)
    }();${EOL}
    ${EOL}
        return return res.json({${EOL}
            errorCode,${EOL}
            data${EOL}
        })${EOL}
    }${EOL}

    const findAll =  async (req:Request ,res:Response) => { ${EOL}
    const result = validationResult(req);${EOL}
    if(!result.isEmpty()){${EOL}
        return res.json({${EOL}
            errorCode:'VALIDATION_ERROR',${EOL}
            data:result.array()${EOL}
        })${EOL}
    }${EOL}
    const {errorCode,data} = await findAll${
      fileName.charAt(0).toUpperCase() + fileName.slice(1)
    }();${EOL}
    ${EOL}
        return return res.json({${EOL}
            errorCode,${EOL}
            data${EOL}
        })${EOL}
    }${EOL}


    const delete =  async (req:Request ,res:Response) => { ${EOL}
    const result = validationResult(req);${EOL}
    if(!result.isEmpty()){${EOL}
        return res.json({${EOL}
            errorCode:'VALIDATION_ERROR',${EOL}
            data:result.array()${EOL}
        })${EOL}
    }${EOL}
    const {errorCode,data} = await delete${
      fileName.charAt(0).toUpperCase() + fileName.slice(1)
    }();${EOL}
    ${EOL}
        return return res.json({${EOL}
            errorCode,${EOL}
            data${EOL}
        })${EOL}
    }${EOL}


    export const ${fileName}Controller = [
        create,
        edit,
        update,
        delete,
        findAll
    ]
    
    `;
  var dir = "src/controllers";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    `src/controllers/${fileName}.controller.ts`,
    controllerString
  );
}

function handleValidations() {
  let validatorString = `import { body } from 'express-validator';${EOL}`;

  for (let index = 0; index < config.tables.length; index++) {
    const element = config.tables[index];
    // console.log('e',element)
    validatorString += `const validateCreate${
      config.tables[index].name.charAt(0).toUpperCase() +
      config.tables[index].name.slice(1)
    }Request =  [ ${EOL}`;
    element.columns.forEach((ele) => {
      if (ele.name != "timestamps" && !ele.notRequiredInForm) {
        validatorString += `body("${ele.name}").notEmpty(), ${EOL}`;
      }
    });
    validatorString += `] ${EOL}`;

    validatorString += `const validateUpdate${
      config.tables[index].name.charAt(0).toUpperCase() +
      config.tables[index].name.slice(1)
    }Request =  [ ${EOL} body("id").notEmpty(), ${EOL}`;
    element.columns.forEach((eleUpdate) => {
      if (eleUpdate.name != "timestamps" && !eleUpdate.notRequiredInForm) {
        validatorString += `body("${eleUpdate.name}").notEmpty(), ${EOL}`;
      }
    });
    validatorString += `] ${EOL}`;

    validatorString += `const validateEdit${
      config.tables[index].name.charAt(0).toUpperCase() +
      config.tables[index].name.slice(1)
    }Request  = [ ${EOL}`;
    validatorString += `body("id").notEmpty(), ${EOL}`;
    validatorString += `] ${EOL}`;

    validatorString += `const validateDelete${
      config.tables[index].name.charAt(0).toUpperCase() +
      config.tables[index].name.slice(1)
    }Request  =  [ ${EOL}`;
    validatorString += `body("id").notEmpty(), ${EOL}`;
    validatorString += `] ${EOL}`;
  }
  var dir = "src/validations";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync("src/validations/validation.ts", validatorString);
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
  fs.writeFileSync("schema.prisma", schemaString);
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
      typeString += `${ele.name} : ${
        ele.type === "Int" ? "Number" : "string;"
      } ${EOL}`;
    }
  });
  typeString += `}${EOL}`;

  typeString += `
    export interface IEdit${
      fileName.charAt(0).toUpperCase() + fileName.slice(1)
    } {${EOL}
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
  typeString += `}${EOL}`;
  typeString += `
    
   export interface IDelete${
     fileName.charAt(0).toUpperCase() + fileName.slice(1)
   } { ${EOL}
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
