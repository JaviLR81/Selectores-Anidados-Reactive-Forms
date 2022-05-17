import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { switchMap, tap } from 'rxjs/operators';

import { PaisesService } from '../../services/paises.service';
import { PaisSmall } from '../../interfaces/paises.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region   : ['', Validators.required ],
    pais     : ['', Validators.required ],
    frontera : ['', Validators.required ],
  })

  // Llenar selectores
  regiones : string[]    = [];
  paises   : PaisSmall[] = [];
  // fronteras: string[]    = []
  fronteras: PaisSmall[] = []

  // UI
  cargando: boolean = false;


  constructor( private fb: FormBuilder,
               private paisesService: PaisesService ) { }

  ngOnInit(): void {

    this.regiones = this.paisesService.regiones;


    // Cuando cambie la region
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        tap( ( _ ) => {
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        }),
        switchMap( region => this.paisesService.getPaisesPorRegion( region ) )
      )
      .subscribe( paises => {
        console.log("~ paises", paises);
        this.paises = paises;
        this.cargando = false;
    });

    // Cuando cambia el país
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        // Efectos secundarios
        tap( () => {
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        // Cambiar la respuesta
        switchMap( codigo => this.paisesService.getPaisPorCodigo( codigo ) ),
        // Cambiar la respuesta
        switchMap( (pais: any) => this.paisesService.getPaisesPorCodigos( pais?.[0]?.borders! ) )
      )
      .subscribe( paises => {
        console.log("fronteras",paises);

        // this.fronteras = pais?.borders || [];
        this.fronteras = paises;
        this.cargando = false;
      })

  }


  guardar() {
    console.log(this.miFormulario.value);
  }

}
