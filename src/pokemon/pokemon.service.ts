import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {   
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;

    } catch (error) {
      this.handelExceptions( error )
    }
  }

  async findAll() {
    
    const pokemon = await this.pokemonModel.find({})
    return pokemon;
  }

  async findOne(term: string) {

    let pokemon:Pokemon;

    if ( !isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //MongoID
    if ( !pokemon && isValidObjectId( term )){
      pokemon = await this.pokemonModel.findById( term )
    }

    //Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);

    return pokemon;
    //return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );

    if ( updatePokemonDto.name ) {
      updatePokemonDto.name =  updatePokemonDto.name.toLocaleLowerCase()
    }

    try {
      await pokemon.updateOne( updatePokemonDto, {new: true});   
      return  {...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handelExceptions( error )
    }   
  }

  async remove(id: string) {
    // const pokemen = await this.findOne ( id );
    // await pokemen.deleteOne();
    // return { id }
    // const result = await this.pokemonModel.findByIdAndDelete( id )

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id:id });

    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with "${ id }" Not found`)

    return;
  }

  private handelExceptions(error: any){

    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon existe en la Base de Datos ${ JSON.stringify( error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't Create Pokemon - Check Server logs`)
  }

}
