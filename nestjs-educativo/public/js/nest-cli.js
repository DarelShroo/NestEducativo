/**
 * NestJS CLI Simulator
 * Simulates nest generate commands creating realistic file structures.
 */

class NestCLI {
  constructor() {
    this.aliases = {
      mo: 'module',
      co: 'controller',
      s: 'service',
      res: 'resource',
      gu: 'guard',
      in: 'interceptor',
      pi: 'pipe',
      d: 'decorator',
      f: 'filter',
    };
    this.history = [];
    this.onOutput = null;
  }

  execute(input) {
    const trimmed = input.trim();
    this.history.push(trimmed);
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    if (parts[0] !== 'nest')
      return this._out(`Error: comando desconocido '${parts[0]}'. Usa 'nest'.`, true);
    if (parts.length < 2) return this._out('Uso: nest generate <schematic> <name>', true);

    const cmd = parts[1];
    if (cmd === 'g' || cmd === 'generate') {
      if (parts.length < 4) return this._out('Uso: nest generate <schematic> <name>', true);
      const schematic = this.aliases[parts[2]] || parts[2];
      const name = parts[3].toLowerCase();
      const noSpec = trimmed.includes('--no-spec');
      return this._generate(schematic, name, noSpec);
    }
    if (cmd === 'new') {
      return this._out(
        'El proyecto ya está inicializado. Usa "nest generate" para crear recursos.'
      );
    }
    if (cmd === 'help' || cmd === '--help') return this._showHelp();
    return this._out(`Subcomando desconocido '${cmd}'. Usa 'nest help'.`, true);
  }

  _generate(schematic, name, noSpec) {
    const vfs = window.vfs;
    if (!vfs) return this._out('Error interno: VFS no disponible.', true);

    const generators = {
      module: () => this._genModule(name, noSpec),
      controller: () => this._genController(name, noSpec),
      service: () => this._genService(name, noSpec),
      resource: () => this._genResource(name, noSpec),
      guard: () => this._genGuard(name, noSpec),
      interceptor: () => this._genInterceptor(name, noSpec),
      pipe: () => this._genPipe(name, noSpec),
      decorator: () => this._genDecorator(name, noSpec),
      filter: () => this._genFilter(name, noSpec),
    };

    const gen = generators[schematic];
    if (!gen)
      return this._out(
        `Schematic desconocido '${schematic}'. Tipos: module, controller, service, resource, guard, interceptor, pipe, decorator, filter`,
        true
      );
    return gen();
  }

  _genModule(name, noSpec) {
    const cls = this._classify(name);
    const files = [
      {
        path: `src/${name}/${name}.module.ts`,
        content: `import { Module } from '@nestjs/common';\n\n@Module({})\nexport class ${cls}Module {}\n`,
      },
    ];
    this._createFiles(files);
    this._updateAppModule(name, cls);
    this._out(`CREATE src/${name}/${name}.module.ts\nUPDATE src/app.module.ts`);
  }

  _genController(name, noSpec) {
    const cls = this._classify(name);
    const files = [
      {
        path: `src/${name}/${name}.controller.ts`,
        content: `import { Controller } from '@nestjs/common';\n\n@Controller('${name}')\nexport class ${cls}Controller {}\n`,
      },
    ];
    let createMsg = `CREATE src/${name}/${name}.controller.ts`;

    if (!noSpec) {
      files.push({
        path: `src/${name}/${name}.controller.spec.ts`,
        content: `import { Test, TestingModule } from '@nestjs/testing';\nimport { ${cls}Controller } from './${name}.controller';\n\ndescribe('${cls}Controller', () => {\n  let controller: ${cls}Controller;\n\n  beforeEach(async () => {\n    const module: TestingModule = await Test.createTestingModule({\n      controllers: [${cls}Controller],\n    }).compile();\n\n    controller = module.get<${cls}Controller>(${cls}Controller);\n  });\n\n  it('should be defined', () => {\n    expect(controller).toBeDefined();\n  });\n});\n`,
      });
      createMsg = `CREATE src/${name}/${name}.controller.spec.ts\nCREATE src/${name}/${name}.controller.ts`;
    }

    this._createFiles(files, createMsg);
    this._updateModule(name, `${cls}Controller`, 'controllers', `./${name}.controller`);
  }

  _genService(name, noSpec) {
    const cls = this._classify(name);
    const files = [
      {
        path: `src/${name}/${name}.service.ts`,
        content: `import { Injectable } from '@nestjs/common';\n\n@Injectable()\nexport class ${cls}Service {}\n`,
      },
    ];
    let createMsg = `CREATE src/${name}/${name}.service.ts`;

    if (!noSpec) {
      files.push({
        path: `src/${name}/${name}.service.spec.ts`,
        content: `import { Test, TestingModule } from '@nestjs/testing';\nimport { ${cls}Service } from './${name}.service';\n\ndescribe('${cls}Service', () => {\n  let service: ${cls}Service;\n\n  beforeEach(async () => {\n    const module: TestingModule = await Test.createTestingModule({\n      providers: [${cls}Service],\n    }).compile();\n\n    service = module.get<${cls}Service>(${cls}Service);\n  });\n\n  it('should be defined', () => {\n    expect(service).toBeDefined();\n  });\n});\n`,
      });
      createMsg = `CREATE src/${name}/${name}.service.spec.ts\nCREATE src/${name}/${name}.service.ts`;
    }

    this._createFiles(files, createMsg);
    this._updateModule(name, `${cls}Service`, 'providers', `./${name}.service`);
  }

  _genResource(name, noSpec) {
    const cls = this._classify(name);
    const lines = [];

    // Module
    const modContent = `import { Module } from '@nestjs/common';\nimport { ${cls}Service } from './${name}.service';\nimport { ${cls}Controller } from './${name}.controller';\n\n@Module({\n  controllers: [${cls}Controller],\n  providers: [${cls}Service],\n})\nexport class ${cls}Module {}\n`;

    // Controller
    const ctrlContent = `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';\nimport { ${cls}Service } from './${name}.service';\nimport { Create${cls}Dto } from './dto/create-${name}.dto';\nimport { Update${cls}Dto } from './dto/update-${name}.dto';\n\n@Controller('${name}')\nexport class ${cls}Controller {\n  constructor(private readonly ${name}Service: ${cls}Service) {}\n\n  @Post()\n  create(@Body() create${cls}Dto: Create${cls}Dto) {\n    return this.${name}Service.create(create${cls}Dto);\n  }\n\n  @Get()\n  findAll() {\n    return this.${name}Service.findAll();\n  }\n\n  @Get(':id')\n  findOne(@Param('id') id: string) {\n    return this.${name}Service.findOne(+id);\n  }\n\n  @Patch(':id')\n  update(@Param('id') id: string, @Body() update${cls}Dto: Update${cls}Dto) {\n    return this.${name}Service.update(+id, update${cls}Dto);\n  }\n\n  @Delete(':id')\n  remove(@Param('id') id: string) {\n    return this.${name}Service.remove(+id);\n  }\n}\n`;

    // Service
    const svcContent = `import { Injectable } from '@nestjs/common';\nimport { Create${cls}Dto } from './dto/create-${name}.dto';\nimport { Update${cls}Dto } from './dto/update-${name}.dto';\n\n@Injectable()\nexport class ${cls}Service {\n  create(create${cls}Dto: Create${cls}Dto) {\n    return 'This action adds a new ${name}';\n  }\n\n  findAll() {\n    return \`This action returns all ${name}\`;\n  }\n\n  findOne(id: number) {\n    return \`This action returns a #\${id} ${name}\`;\n  }\n\n  update(id: number, update${cls}Dto: Update${cls}Dto) {\n    return \`This action updates a #\${id} ${name}\`;\n  }\n\n  remove(id: number) {\n    return \`This action removes a #\${id} ${name}\`;\n  }\n}\n`;

    // DTOs
    const createDto = `export class Create${cls}Dto {}\n`;
    const updateDto = `import { PartialType } from '@nestjs/mapped-types';\nimport { Create${cls}Dto } from './create-${name}.dto';\n\nexport class Update${cls}Dto extends PartialType(Create${cls}Dto) {}\n`;

    // Entity
    const entity = `export class ${cls} {}\n`;

    const files = [
      { path: `src/${name}/${name}.module.ts`, content: modContent },
      { path: `src/${name}/${name}.controller.ts`, content: ctrlContent },
      { path: `src/${name}/${name}.service.ts`, content: svcContent },
      { path: `src/${name}/dto/create-${name}.dto.ts`, content: createDto },
      { path: `src/${name}/dto/update-${name}.dto.ts`, content: updateDto },
      { path: `src/${name}/entities/${name}.entity.ts`, content: entity },
    ];

    lines.push(`CREATE src/${name}/${name}.module.ts`);

    if (!noSpec) {
      files.push({
        path: `src/${name}/${name}.controller.spec.ts`,
        content: `import { Test, TestingModule } from '@nestjs/testing';\nimport { ${cls}Controller } from './${name}.controller';\nimport { ${cls}Service } from './${name}.service';\n\ndescribe('${cls}Controller', () => {\n  let controller: ${cls}Controller;\n\n  beforeEach(async () => {\n    const module: TestingModule = await Test.createTestingModule({\n      controllers: [${cls}Controller],\n      providers: [${cls}Service],\n    }).compile();\n\n    controller = module.get<${cls}Controller>(${cls}Controller);\n  });\n\n  it('should be defined', () => {\n    expect(controller).toBeDefined();\n  });\n});\n`,
      });
      files.push({
        path: `src/${name}/${name}.service.spec.ts`,
        content: `import { Test, TestingModule } from '@nestjs/testing';\nimport { ${cls}Service } from './${name}.service';\n\ndescribe('${cls}Service', () => {\n  let service: ${cls}Service;\n\n  beforeEach(async () => {\n    const module: TestingModule = await Test.createTestingModule({\n      providers: [${cls}Service],\n    }).compile();\n\n    service = module.get<${cls}Service>(${cls}Service);\n  });\n\n  it('should be defined', () => {\n    expect(service).toBeDefined();\n  });\n});\n`,
      });
      lines.push(`CREATE src/${name}/${name}.controller.spec.ts`);
    }

    lines.push(`CREATE src/${name}/${name}.controller.ts`);
    if (!noSpec) {
      lines.push(`CREATE src/${name}/${name}.service.spec.ts`);
    }
    lines.push(`CREATE src/${name}/${name}.service.ts`);
    lines.push(`CREATE src/${name}/dto/create-${name}.dto.ts`);
    lines.push(`CREATE src/${name}/dto/update-${name}.dto.ts`);
    lines.push(`CREATE src/${name}/entities/${name}.entity.ts`);

    this._createFiles(files);
    this._updateAppModule(name, cls);
    lines.push(`UPDATE src/app.module.ts`);
    this._out(lines.join('\n'));
  }

  _genGuard(name) {
    const cls = this._classify(name);
    const content = `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';\nimport { Observable } from 'rxjs';\n\n@Injectable()\nexport class ${cls}Guard implements CanActivate {\n  canActivate(\n    context: ExecutionContext,\n  ): boolean | Promise<boolean> | Observable<boolean> {\n    const request = context.switchToHttp().getRequest();\n    // TODO: implement guard logic\n    return true;\n  }\n}\n`;
    this._createFiles(
      [{ path: `src/common/guards/${name}.guard.ts`, content }],
      `CREATE src/common/guards/${name}.guard.ts`
    );
  }

  _genInterceptor(name) {
    const cls = this._classify(name);
    const content = `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';\nimport { Observable } from 'rxjs';\nimport { tap } from 'rxjs/operators';\n\n@Injectable()\nexport class ${cls}Interceptor implements NestInterceptor {\n  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n    const now = Date.now();\n    return next.handle().pipe(\n      tap(() => console.log(\`\${context.getClass().name} - \${Date.now() - now}ms\`)),\n    );\n  }\n}\n`;
    this._createFiles(
      [{ path: `src/common/interceptors/${name}.interceptor.ts`, content }],
      `CREATE src/common/interceptors/${name}.interceptor.ts`
    );
  }

  _genPipe(name) {
    const cls = this._classify(name);
    const content = `import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';\n\n@Injectable()\nexport class ${cls}Pipe implements PipeTransform {\n  transform(value: any, metadata: ArgumentMetadata) {\n    // TODO: implement pipe logic\n    return value;\n  }\n}\n`;
    this._createFiles(
      [{ path: `src/common/pipes/${name}.pipe.ts`, content }],
      `CREATE src/common/pipes/${name}.pipe.ts`
    );
  }

  _genDecorator(name) {
    const cls = this._classify(name);
    const content = `import { createParamDecorator, ExecutionContext } from '@nestjs/common';\n\nexport const ${cls} = createParamDecorator(\n  (data: unknown, ctx: ExecutionContext) => {\n    const request = ctx.switchToHttp().getRequest();\n    // TODO: implement decorator logic\n    return request;\n  },\n);\n`;
    this._createFiles(
      [{ path: `src/common/decorators/${name}.decorator.ts`, content }],
      `CREATE src/common/decorators/${name}.decorator.ts`
    );
  }

  _genFilter(name) {
    const cls = this._classify(name);
    const content = `import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';\nimport { Request, Response } from 'express';\n\n@Catch(HttpException)\nexport class ${cls}Filter implements ExceptionFilter {\n  catch(exception: HttpException, host: ArgumentsHost) {\n    const ctx = host.switchToHttp();\n    const response = ctx.getResponse<Response>();\n    const status = exception.getStatus();\n\n    response.status(status).json({\n      statusCode: status,\n      message: exception.message,\n      timestamp: new Date().toISOString(),\n    });\n  }\n}\n`;
    this._createFiles(
      [{ path: `src/common/filters/${name}.filter.ts`, content }],
      `CREATE src/common/filters/${name}.filter.ts`
    );
  }

  _updateModule(name, className, arrayName, importPath) {
    const vfs = window.vfs;
    let modPath = `src/${name}/${name}.module.ts`;
    let relativeImportPath = importPath;

    // If specific module doesn't exist, fallback to app.module.ts (closest module simulation)
    if (!vfs.hasFile(modPath)) {
      modPath = 'src/app.module.ts';
      if (!vfs.hasFile(modPath)) return;
      // Adjust relative import path since we are in src/
      relativeImportPath = `./${name}/${importPath.replace('./', '')}`;
    }

    let content = vfs.getContent(modPath);
    const importStatement = `import { ${className} } from '${relativeImportPath}';`;
    if (!content.includes(importStatement)) {
      content = `${importStatement}\n` + content;
    }

    // Add to array if exists
    const regex = new RegExp(`(${arrayName}:\\s*\\[)([^\\]]*)`, 's');
    if (regex.test(content)) {
      content = content.replace(regex, (m, start, items) => {
        if (items.includes(className)) return m; // already in array
        const trimmed = items.trim();
        return trimmed ? `${start}${items.trim()}, ${className}` : `${start}${className}`;
      });
    } else {
      // Check if it's empty @Module({})
      const emptyModuleRegex = /@Module\(\{\}\)/;
      if (emptyModuleRegex.test(content)) {
        content = content.replace(
          emptyModuleRegex,
          `@Module({\n  ${arrayName}: [\n    ${className}\n  ]\n})`
        );
      } else {
        // Array doesn't exist, inject it into @Module({
        const moduleRegex = /(@Module\s*\(\s*\{)/;
        // Only inject if it doesn't already have it (naive check just in case)
        if (!content.includes(`${arrayName}:`)) {
          content = content.replace(moduleRegex, `$1\n  ${arrayName}: [${className}],`);
        }
      }
    }

    vfs.setContent(modPath, content);
    const doc = vfs.getDoc(modPath);
    if (doc) doc.setValue(content);
    this._out(`UPDATE ${modPath}`);
  }

  _updateAppModule(name, cls) {
    const vfs = window.vfs;
    const appModPath = 'src/app.module.ts';
    if (!vfs.hasFile(appModPath)) return;
    let content = vfs.getContent(appModPath);
    const modName = `${cls}Module`;

    const importStatement = `import { ${modName} } from './${name}/${name}.module';`;
    if (!content.includes(importStatement)) {
      content = `${importStatement}\n` + content;
    }

    const importsRegex = /(imports:\s*\[)([^\]]*)/s;
    if (importsRegex.test(content)) {
      content = content.replace(importsRegex, (m, start, items) => {
        if (items.includes(modName)) return m; // already in array
        const trimmed = items.trim();
        return trimmed ? `${start}${items.trim()}, ${modName}` : `${start}${modName}`;
      });
    } else {
      const moduleRegex = /(@Module\s*\(\s*\{)/;
      if (!content.includes(`imports:`)) {
        content = content.replace(moduleRegex, `$1 imports: [${modName}], `);
      }
    }

    vfs.setContent(appModPath, content);
    const doc = vfs.getDoc(appModPath);
    if (doc) doc.setValue(content);
  }

  _createFiles(files, outputMsg) {
    const vfs = window.vfs;
    const editor = window.codeEditor;
    files.forEach((f) => {
      vfs.createFile(f.path, f.content);
      if (editor) editor.openTab(f.path, f.content);
    });
    if (outputMsg) this._out(outputMsg);
  }

  _classify(name) {
    return (
      name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    );
  }

  _out(msg, isError) {
    if (this.onOutput) this.onOutput(msg, isError);
  }

  _showHelp() {
    this._out(`Comandos disponibles:
  nest generate <schematic> <name>
  nest g <alias> <name>

Schematics:
  module (mo)       Genera un módulo
  controller (co)   Genera un controlador
  service (s)       Genera un servicio
  resource (res)    Genera módulo + ctrl + svc + dto + entity
  guard (gu)        Genera un guard
  interceptor (in)  Genera un interceptor
  pipe (pi)         Genera un pipe
  decorator (d)     Genera un decorador
  filter (f)        Genera un exception filter

Ejemplos:
  nest g res users
  nest g mo auth
  nest g gu jwt-auth`);
  }
}

window.NestCLI = NestCLI;
